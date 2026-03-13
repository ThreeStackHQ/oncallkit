import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { monitors, monitorChecks, incidents, incidentEvents } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import * as net from 'net';

interface MonitorJob {
  monitorId: string;
}

interface MonitorState {
  consecutiveFails: number;
  lastStatus: 'up' | 'down';
}

async function performHttpCheck(
  url: string,
  timeout: number,
): Promise<{ status: 'up' | 'down' | 'timeout'; responseMs: number; statusCode?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout * 1000);
  const start = Date.now();

  try {
    const res = await fetch(url, { signal: controller.signal });
    const responseMs = Date.now() - start;
    clearTimeout(timer);
    return {
      status: res.ok ? 'up' : 'down',
      responseMs,
      statusCode: res.status,
    };
  } catch (err) {
    clearTimeout(timer);
    const responseMs = Date.now() - start;
    if ((err as Error).name === 'AbortError') {
      return { status: 'timeout', responseMs };
    }
    return { status: 'down', responseMs };
  }
}

async function performTcpCheck(
  url: string,
  timeout: number,
): Promise<{ status: 'up' | 'down' | 'timeout'; responseMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    let host = url;
    let port = 80;

    // Parse host:port from URL
    const match = url.replace(/^(tcp:\/\/|https?:\/\/)/, '').match(/^([^:]+)(?::(\d+))?/);
    if (match) {
      host = match[1];
      if (match[2]) port = parseInt(match[2]);
    }

    const socket = net.createConnection({ host, port, timeout: timeout * 1000 });

    socket.on('connect', () => {
      const responseMs = Date.now() - start;
      socket.destroy();
      resolve({ status: 'up', responseMs });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ status: 'timeout', responseMs: timeout * 1000 });
    });

    socket.on('error', () => {
      const responseMs = Date.now() - start;
      socket.destroy();
      resolve({ status: 'down', responseMs });
    });
  });
}

async function triggerIncident(
  monitor: { id: string; workspaceId: string; name: string; escalationPolicyId: string | null },
): Promise<void> {
  const [incident] = await db
    .insert(incidents)
    .values({
      workspaceId: monitor.workspaceId,
      monitorId: monitor.id,
      title: `${monitor.name} is DOWN`,
      severity: 'critical',
    })
    .returning();

  await db.insert(incidentEvents).values({
    incidentId: incident.id,
    type: 'triggered',
    message: `Monitor ${monitor.name} failed 3 consecutive checks`,
  });

  // Trigger escalation if policy exists
  if (monitor.escalationPolicyId) {
    const { escalationQueue } = await import('@/lib/redis');
    await escalationQueue.add('escalate', {
      incidentId: incident.id,
      policyId: monitor.escalationPolicyId,
      stepIndex: 0,
    });
  }
}

async function autoResolveIncident(monitorId: string): Promise<void> {
  // Find open incident for this monitor
  const [incident] = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.monitorId, monitorId),
        eq(incidents.status, 'open'),
      ),
    )
    .limit(1);

  if (incident) {
    await db
      .update(incidents)
      .set({ status: 'resolved', resolvedAt: new Date() })
      .where(eq(incidents.id, incident.id));

    await db.insert(incidentEvents).values({
      incidentId: incident.id,
      type: 'resolved',
      message: 'Monitor recovered — incident auto-resolved',
    });
  }
}

export function startMonitorWorker(): Worker {
  const worker = new Worker<MonitorJob>(
    'monitor-runner',
    async (job: Job<MonitorJob>) => {
      const { monitorId } = job.data;

      const [monitor] = await db
        .select()
        .from(monitors)
        .where(eq(monitors.id, monitorId))
        .limit(1);

      if (!monitor || monitor.isPaused) return;

      // Perform check
      let checkResult: { status: 'up' | 'down' | 'timeout'; responseMs: number; statusCode?: number };

      if (monitor.type === 'tcp') {
        checkResult = await performTcpCheck(monitor.url, monitor.timeout);
      } else {
        // HTTP and ping both use HTTP check
        checkResult = await performHttpCheck(monitor.url, monitor.timeout);
      }

      // Record check
      await db.insert(monitorChecks).values({
        monitorId,
        status: checkResult.status,
        responseMs: checkResult.responseMs,
        statusCode: checkResult.statusCode ?? null,
      });

      // Get/update state
      const stateKey = `monitor:state:${monitorId}`;
      const rawState = await redis.get(stateKey);
      const state: MonitorState = rawState
        ? JSON.parse(rawState)
        : { consecutiveFails: 0, lastStatus: 'up' };

      const isDown = checkResult.status !== 'up';

      if (isDown) {
        state.consecutiveFails += 1;
        state.lastStatus = 'down';

        if (state.consecutiveFails === 3) {
          await triggerIncident(monitor);
        }
      } else {
        const wasDown = state.lastStatus === 'down';
        state.consecutiveFails = 0;
        state.lastStatus = 'up';

        if (wasDown) {
          await autoResolveIncident(monitorId);
        }
      }

      await redis.set(stateKey, JSON.stringify(state), 'EX', 86400);
    },
    { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 10 },
  );

  worker.on('failed', (job, err) => {
    console.error(`Monitor job ${job?.id} failed:`, err.message);
  });

  return worker;
}
