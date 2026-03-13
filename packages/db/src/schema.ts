import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

// ─── Enums ──────────────────────────────────────────────────────────────────

export const planEnum = pgEnum('plan', ['free', 'pro', 'team']);
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'member']);
export const scheduleTypeEnum = pgEnum('schedule_type', ['weekly', 'daily', 'custom']);
export const incidentSeverityEnum = pgEnum('incident_severity', ['critical', 'warning', 'info']);
export const incidentStatusEnum = pgEnum('incident_status', ['open', 'acknowledged', 'resolved']);
export const alertChannelTypeEnum = pgEnum('alert_channel_type', ['email', 'slack', 'sms', 'webhook']);
export const incidentEventTypeEnum = pgEnum('incident_event_type', [
  'triggered',
  'acknowledged',
  'resolved',
  'escalated',
  'notified',
]);
export const notificationStatusEnum = pgEnum('notification_status', ['sent', 'failed']);
export const monitorTypeEnum = pgEnum('monitor_type', ['http', 'tcp', 'ping']);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
  stripePriceId: text('stripe_price_id'),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rotationSchedules = pgTable('rotation_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
  type: scheduleTypeEnum('type').default('weekly').notNull(),
  /** Array of { userId: string, order: number } */
  members: jsonb('members').default([]).notNull(),
  startDate: timestamp('start_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const escalationPolicies = pgTable('escalation_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  /** Array of { delayMinutes: number, targets: [{ type: 'user'|'team', id: string }] } */
  steps: jsonb('steps').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monitors = pgTable('monitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: monitorTypeEnum('type').default('http').notNull(),
  url: text('url').notNull(),
  interval: integer('interval').default(60).notNull(), // seconds
  timeout: integer('timeout').default(30).notNull(), // seconds
  escalationPolicyId: uuid('escalation_policy_id').references(
    () => escalationPolicies.id,
  ),
  isPaused: boolean('is_paused').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monitorCheckStatusEnum = pgEnum('monitor_check_status', ['up', 'down', 'timeout']);

export const monitorChecks = pgTable('monitor_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  monitorId: uuid('monitor_id')
    .notNull()
    .references(() => monitors.id, { onDelete: 'cascade' }),
  status: monitorCheckStatusEnum('status').notNull(),
  responseMs: integer('response_ms'),
  statusCode: integer('status_code'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  monitorId: uuid('monitor_id').references(() => monitors.id),
  title: text('title').notNull(),
  severity: incidentSeverityEnum('severity').default('critical').notNull(),
  status: incidentStatusEnum('status').default('open').notNull(),
  triggeredBy: uuid('triggered_by').references(() => users.id),
  acknowledgedBy: uuid('acknowledged_by').references(() => users.id),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incidentEvents = pgTable('incident_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  type: incidentEventTypeEnum('type').notNull(),
  message: text('message'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertChannels = pgTable('alert_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: alertChannelTypeEnum('type').notNull(),
  /** Channel-specific config: { email, webhookUrl, slackWebhook, phoneNumber } */
  config: jsonb('config').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const onCallAssignments = pgTable('on_call_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id')
    .notNull()
    .references(() => rotationSchedules.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  channelId: uuid('channel_id').references(() => alertChannels.id),
  status: notificationStatusEnum('status').notNull(),
  message: text('message'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type RotationSchedule = typeof rotationSchedules.$inferSelect;
export type EscalationPolicy = typeof escalationPolicies.$inferSelect;
export type Monitor = typeof monitors.$inferSelect;
export type MonitorCheck = typeof monitorChecks.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type IncidentEvent = typeof incidentEvents.$inferSelect;
export type AlertChannel = typeof alertChannels.$inferSelect;
export type OnCallAssignment = typeof onCallAssignments.$inferSelect;
export type NotificationLog = typeof notificationLogs.$inferSelect;
