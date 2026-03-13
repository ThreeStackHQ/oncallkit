import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { monitors, monitorChecks } from '@oncallkit/db';
import { eq, and, gte, desc } from '@oncallkit/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateMonitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['http', 'tcp', 'ping']).optional(),
  url: z.string().min(1).optional(),
  interval: z.number().int().min(30).max(3600).optional(),
  timeout: z.number().int().min(5).max(120).optional(),
  escalationPolicyId: z.string().uuid().nullable().optional(),
});

async function getMonitorOrFail(id: string, workspaceId: string) {
  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, id), eq(monitors.workspaceId, workspaceId)))
    .limit(1);
  return monitor ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  const monitor = await getMonitorOrFail(params.id, workspaceId);

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  // Last 24h checks
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const checks = await db
    .select()
    .from(monitorChecks)
    .where(and(eq(monitorChecks.monitorId, params.id), gte(monitorChecks.checkedAt, since)))
    .orderBy(desc(monitorChecks.checkedAt))
    .limit(200);

  return NextResponse.json({ ...monitor, checks });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  const monitor = await getMonitorOrFail(params.id, workspaceId);

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateMonitorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [updated] = await db
    .update(monitors)
    .set(parsed.data)
    .where(eq(monitors.id, params.id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  const monitor = await getMonitorOrFail(params.id, workspaceId);

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  await db.delete(monitors).where(eq(monitors.id, params.id));

  return NextResponse.json({ deleted: true });
}
