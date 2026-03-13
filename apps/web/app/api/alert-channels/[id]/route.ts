import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { alertChannels } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const [channel] = await db
    .select()
    .from(alertChannels)
    .where(
      and(eq(alertChannels.id, params.id), eq(alertChannels.workspaceId, workspaceId)),
    )
    .limit(1);

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  await db.delete(alertChannels).where(eq(alertChannels.id, params.id));

  return NextResponse.json({ deleted: true });
}
