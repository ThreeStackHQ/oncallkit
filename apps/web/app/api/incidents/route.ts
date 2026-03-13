import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { incidents, incidentEvents } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateIncidentSchema = z.object({
  title: z.string().min(1).max(255),
  severity: z.enum(['critical', 'warning', 'info']).default('critical'),
  monitorId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as 'open' | 'acknowledged' | 'resolved' | null;
  const severity = searchParams.get('severity') as 'critical' | 'warning' | 'info' | null;
  const monitorId = searchParams.get('monitorId');

  const conditions = [eq(incidents.workspaceId, workspaceId)];
  if (status) conditions.push(eq(incidents.status, status));
  if (severity) conditions.push(eq(incidents.severity, severity));
  if (monitorId) conditions.push(eq(incidents.monitorId!, monitorId));

  const rows = await db
    .select()
    .from(incidents)
    .where(and(...conditions));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateIncidentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [incident] = await db
    .insert(incidents)
    .values({
      workspaceId,
      title: parsed.data.title,
      severity: parsed.data.severity,
      monitorId: parsed.data.monitorId ?? null,
      triggeredBy: userId,
    })
    .returning();

  // Auto-create triggered event
  await db.insert(incidentEvents).values({
    incidentId: incident.id,
    type: 'triggered',
    message: `Incident triggered: ${incident.title}`,
    userId,
  });

  return NextResponse.json(incident, { status: 201 });
}
