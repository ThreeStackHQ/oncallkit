import { Worker, Job } from 'bullmq';
import { redis, notificationQueue } from '@/lib/redis';
import { db } from '@/lib/db';
import { incidents, incidentEvents, escalationPolicies, alertChannels, workspaceMembers, users } from '@oncallkit/db';
import { eq } from '@oncallkit/db';

interface EscalationJob {
  incidentId: string;
  policyId: string;
  stepIndex: number;
}

interface EscalationStep {
  delayMinutes: number;
  targets: Array<{ type: 'user' | 'channel'; id: string }>;
}

export function startEscalationWorker(): Worker {
  const worker = new Worker<EscalationJob>(
    'escalations',
    async (job: Job<EscalationJob>) => {
      const { incidentId, policyId, stepIndex } = job.data;

      // Check if incident is still open
      const [incident] = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, incidentId))
        .limit(1);

      if (!incident || incident.status !== 'open') {
        // Incident acknowledged/resolved — stop escalation
        return;
      }

      // Load escalation policy
      const [policy] = await db
        .select()
        .from(escalationPolicies)
        .where(eq(escalationPolicies.id, policyId))
        .limit(1);

      if (!policy) return;

      const steps = policy.steps as EscalationStep[];

      if (stepIndex >= steps.length) return;

      const step = steps[stepIndex];

      // Record escalation event
      await db.insert(incidentEvents).values({
        incidentId,
        type: 'escalated',
        message: `Escalation step ${stepIndex + 1} of ${steps.length} executed`,
      });

      // Dispatch notifications for each target
      for (const target of step.targets) {
        if (target.type === 'channel') {
          // Notify via alert channel
          const [channel] = await db
            .select()
            .from(alertChannels)
            .where(eq(alertChannels.id, target.id))
            .limit(1);

          if (channel) {
            const config = channel.config as Record<string, string>;
            await notificationQueue.add('notify', {
              incidentId,
              incidentTitle: incident.title,
              severity: incident.severity,
              type: channel.type,
              config,
            });
          }
        } else if (target.type === 'user') {
          // Notify user via email
          const [user] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, target.id))
            .limit(1);

          if (user) {
            await notificationQueue.add('notify', {
              incidentId,
              incidentTitle: incident.title,
              severity: incident.severity,
              type: 'email',
              config: { email: user.email },
            });
          }
        }
      }

      // Schedule next step if exists
      const nextStepIndex = stepIndex + 1;
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const delayMs = nextStep.delayMinutes * 60 * 1000;

        const { escalationQueue } = await import('@/lib/redis');
        await escalationQueue.add(
          'escalate',
          { incidentId, policyId, stepIndex: nextStepIndex },
          { delay: delayMs },
        );
      }
    },
    { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } },
  );

  worker.on('failed', (job, err) => {
    console.error(`Escalation job ${job?.id} failed:`, err.message);
  });

  return worker;
}
