import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { monitors } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, params.id), eq(monitors.workspaceId, workspaceId)))
    .limit(1);

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(monitors)
    .set({ isPaused: !monitor.isPaused })
    .where(eq(monitors.id, params.id))
    .returning();

  return NextResponse.json(updated);
}
