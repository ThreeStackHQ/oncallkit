import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rotationSchedules } from '@oncallkit/db';
import { eq } from '@oncallkit/db';
import { z } from 'zod';
import { generateAssignments } from '@/lib/oncall';

export const dynamic = 'force-dynamic';

const CreateScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().default('UTC'),
  type: z.enum(['weekly', 'daily', 'custom']).default('weekly'),
  members: z
    .array(z.object({ userId: z.string().uuid(), order: z.number().int().min(0) }))
    .default([]),
  startDate: z.string().datetime(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const rows = await db
    .select()
    .from(rotationSchedules)
    .where(eq(rotationSchedules.workspaceId, workspaceId));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [schedule] = await db
    .insert(rotationSchedules)
    .values({
      workspaceId,
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      type: parsed.data.type,
      members: parsed.data.members,
      startDate: new Date(parsed.data.startDate),
    })
    .returning();

  // Generate on-call assignments for the next 30 days
  if (schedule.type !== 'custom') {
    setImmediate(() => generateAssignments(schedule.id).catch(console.error));
  }

  return NextResponse.json(schedule, { status: 201 });
}
