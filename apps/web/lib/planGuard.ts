import { db } from '@/lib/db';
import { workspaces, monitors, workspaceMembers } from '@oncallkit/db';
import { eq, count } from '@oncallkit/db';

interface PlanLimits {
  maxMonitors: number;
  maxMembers: number;
}

export function getPlanLimits(plan: 'free' | 'pro' | 'team'): PlanLimits {
  switch (plan) {
    case 'free':
      return { maxMonitors: 3, maxMembers: 1 };
    case 'pro':
      return { maxMonitors: 25, maxMembers: 10 };
    case 'team':
      return { maxMonitors: Infinity, maxMembers: Infinity };
  }
}

export async function checkMonitorLimit(workspaceId: string): Promise<string | null> {
  const [workspace] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) return 'Workspace not found';

  const limits = getPlanLimits(workspace.plan);
  if (limits.maxMonitors === Infinity) return null;

  const [result] = await db
    .select({ cnt: count() })
    .from(monitors)
    .where(eq(monitors.workspaceId, workspaceId));

  if ((result?.cnt ?? 0) >= limits.maxMonitors) {
    return `Monitor limit reached (${limits.maxMonitors}). Upgrade your plan to add more.`;
  }

  return null;
}

export async function checkMemberLimit(workspaceId: string): Promise<string | null> {
  const [workspace] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) return 'Workspace not found';

  const limits = getPlanLimits(workspace.plan);
  if (limits.maxMembers === Infinity) return null;

  const [result] = await db
    .select({ cnt: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  if ((result?.cnt ?? 0) >= limits.maxMembers) {
    return `Member limit reached (${limits.maxMembers}). Upgrade your plan to add more.`;
  }

  return null;
}
