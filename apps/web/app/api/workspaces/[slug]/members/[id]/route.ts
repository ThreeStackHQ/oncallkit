import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { workspaces, workspaceMembers } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateMemberSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, params.slug))
    .limit(1);

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const userId = (session.user as { id: string }).id;

  // Verify caller is owner
  const [caller] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!caller || caller.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [updated] = await db
    .update(workspaceMembers)
    .set({ role: parsed.data.role })
    .where(
      and(
        eq(workspaceMembers.id, params.id),
        eq(workspaceMembers.workspaceId, workspace.id),
      ),
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
