import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { incidents, incidentEvents } from '@oncallkit/db';
import { eq, and, desc } from '@oncallkit/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const [incident] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, params.id), eq(incidents.workspaceId, workspaceId)))
    .limit(1);

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

  const events = await db
    .select()
    .from(incidentEvents)
    .where(eq(incidentEvents.incidentId, params.id))
    .orderBy(desc(incidentEvents.createdAt))
    .limit(limit);

  return NextResponse.json(events);
}
