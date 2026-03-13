import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { notificationLogs } from '@oncallkit/db';
import { sendIncidentAlert } from '@/lib/resend';
import { sendSMSAlert } from '@/lib/twilio';

interface NotificationJob {
  incidentId: string;
  incidentTitle: string;
  severity: string;
  type: 'email' | 'slack' | 'sms' | 'webhook';
  config: Record<string, string>;
  channelId?: string;
}

async function logNotification(
  incidentId: string,
  channelId: string | undefined,
  status: 'sent' | 'failed',
  message: string,
): Promise<void> {
  await db.insert(notificationLogs).values({
    incidentId,
    channelId: channelId ?? null,
    status,
    message,
  }).catch(console.error);
}

export function startNotificationWorker(): Worker {
  const worker = new Worker<NotificationJob>(
    'notifications',
    async (job: Job<NotificationJob>) => {
      const { incidentId, incidentTitle, severity, type, config, channelId } = job.data;
      const incidentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/incidents/${incidentId}`;

      try {
        switch (type) {
          case 'email': {
            await sendIncidentAlert({
              to: config.email,
              incidentTitle,
              severity,
              incidentUrl,
            });
            break;
          }

          case 'sms': {
            await sendSMSAlert({
              to: config.phoneNumber,
              incidentTitle,
              severity,
            });
            break;
          }

          case 'slack': {
            const color = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#3b82f6';
            const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';

            await fetch(config.slackWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attachments: [
                  {
                    color,
                    blocks: [
                      {
                        type: 'section',
                        text: {
                          type: 'mrkdwn',
                          text: `${emoji} *OnCallKit Alert: ${incidentTitle}*\n*Severity:* ${severity.toUpperCase()}\n<${incidentUrl}|View Incident>`,
                        },
                      },
                    ],
                  },
                ],
              }),
            });
            break;
          }

          case 'webhook': {
            await fetch(config.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                incidentId,
                incidentTitle,
                severity,
                incidentUrl,
                triggeredAt: new Date().toISOString(),
              }),
            });
            break;
          }
        }

        await logNotification(incidentId, channelId, 'sent', `Notification sent via ${type}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await logNotification(incidentId, channelId, 'failed', message);
        throw err; // Let BullMQ retry
      }
    },
    { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    console.error(`Notification job ${job?.id} failed:`, err.message);
  });

  return worker;
}
