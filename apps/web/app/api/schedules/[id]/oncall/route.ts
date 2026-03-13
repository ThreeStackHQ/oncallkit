import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rotationSchedules } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { calculateCurrentOnCall } from '@/lib/oncall';

export const dynamic = 'force-dynamic';

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

  const result = await calculateCurrentOnCall(params.id);

  return NextResponse.json(result);
}
