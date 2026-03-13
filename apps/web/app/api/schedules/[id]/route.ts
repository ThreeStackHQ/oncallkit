import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rotationSchedules } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { z } from 'zod';
import { calculateCurrentOnCall } from '@/lib/oncall';

export const dynamic = 'force-dynamic';

const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  type: z.enum(['weekly', 'daily', 'custom']).optional(),
  members: z
    .array(z.object({ userId: z.string().uuid(), order: z.number().int().min(0) }))
    .optional(),
  startDate: z.string().datetime().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const [schedule] = await db
    .select()
    .from(rotationSchedules)
    .where(
      and(
        eq(rotationSchedules.id, params.id),
        eq(rotationSchedules.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  const oncall = await calculateCurrentOnCall(params.id);

  return NextResponse.json({ ...schedule, oncall });
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

  const [schedule] = await db
    .select()
    .from(rotationSchedules)
    .where(
      and(
        eq(rotationSchedules.id, params.id),
        eq(rotationSchedules.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startDate) {
    updateData.startDate = new Date(parsed.data.startDate);
  }

  const [updated] = await db
    .update(rotationSchedules)
    .set(updateData)
    .where(eq(rotationSchedules.id, params.id))
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

  const [schedule] = await db
    .select()
    .from(rotationSchedules)
    .where(
      and(
        eq(rotationSchedules.id, params.id),
        eq(rotationSchedules.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  await db.delete(rotationSchedules).where(eq(rotationSchedules.id, params.id));

  return NextResponse.json({ deleted: true });
}
