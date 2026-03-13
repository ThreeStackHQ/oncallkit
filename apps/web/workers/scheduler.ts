import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { monitors } from '@oncallkit/db';
import { eq } from '@oncallkit/db';

const monitorQueue = new Queue('monitor-runner', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } });

export async function startMonitorScheduler(): Promise<void> {
  const allMonitors = await db
    .select()
    .from(monitors)
    .where(eq(monitors.isPaused, false));

  // Remove stale repeatable jobs
  const existing = await monitorQueue.getRepeatableJobs();
  for (const job of existing) {
    await monitorQueue.removeRepeatableByKey(job.key);
  }

  // Schedule each active monitor
  for (const monitor of allMonitors) {
    await monitorQueue.add(
      'check',
      { monitorId: monitor.id },
      {
        repeat: { every: monitor.interval * 1000 },
        jobId: `monitor-${monitor.id}`,
      },
    );
  }

  console.log(`[OnCallKit] Scheduled ${allMonitors.length} monitors`);
}

export async function scheduleMonitor(monitorId: string, intervalSeconds: number): Promise<void> {
  await monitorQueue.add(
    'check',
    { monitorId },
    {
      repeat: { every: intervalSeconds * 1000 },
      jobId: `monitor-${monitorId}`,
    },
  );
}

export async function removeMonitorSchedule(monitorId: string): Promise<void> {
  const jobs = await monitorQueue.getRepeatableJobs();
  for (const job of jobs) {
    if (job.id === `monitor-${monitorId}`) {
      await monitorQueue.removeRepeatableByKey(job.key);
    }
  }
}
