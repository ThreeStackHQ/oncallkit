import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { incidents, incidentEvents } from '@oncallkit/db';
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
  const userId = (session.user as { id: string }).id;

  const [incident] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, params.id), eq(incidents.workspaceId, workspaceId)))
    .limit(1);

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  if (incident.status === 'resolved') {
    return NextResponse.json({ error: 'Incident already resolved' }, { status: 409 });
  }

  const [updated] = await db
    .update(incidents)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
    })
    .where(eq(incidents.id, params.id))
    .returning();

  await db.insert(incidentEvents).values({
    incidentId: params.id,
    type: 'resolved',
    message: 'Incident resolved',
    userId,
  });

  return NextResponse.json(updated);
}
