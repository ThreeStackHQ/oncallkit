import Redis from 'ioredis';
import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// BullMQ connection options (uses URL to avoid ioredis version conflicts)
const bullConnection = { url: redisUrl };

// ─── Queues ──────────────────────────────────────────────────────────────────

export const incidentQueue = new Queue('incidents', {
  connection: bullConnection,
});

export const notificationQueue = new Queue('notifications', {
  connection: bullConnection,
});

export const escalationQueue = new Queue('escalations', {
  connection: bullConnection,
});

export { Queue };
