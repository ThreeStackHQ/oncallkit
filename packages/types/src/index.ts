export type Plan = 'free' | 'pro' | 'team';
export type IncidentSeverity = 'critical' | 'warning' | 'info';
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved';
export type AlertChannelType = 'email' | 'slack' | 'sms' | 'webhook';
export type MemberRole = 'owner' | 'admin' | 'member';
export type MonitorType = 'http' | 'tcp' | 'ping';

export interface EscalationStep {
  delayMinutes: number;
  targets: { type: 'user' | 'team'; id: string }[];
}

export interface RotationMember {
  userId: string;
  order: number;
}

export interface AlertChannelConfig {
  email?: string;
  webhookUrl?: string;
  slackWebhook?: string;
  phoneNumber?: string;
}

export const PLANS = {
  free: { name: 'Free', price: 0, requestsPerMonth: 1000, monitors: 3 },
  pro: { name: 'Pro', price: 9, requestsPerMonth: 50000, monitors: 25 },
  team: { name: 'Team', price: 29, requestsPerMonth: -1, monitors: -1 },
} as const;
