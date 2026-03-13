import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { workspaces, workspaceMembers, users } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { z } from 'zod';
import { resend } from '@/lib/resend';
import { checkMemberLimit } from '@/lib/planGuard';

export const dynamic = 'force-dynamic';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
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

  // Verify caller is owner/admin
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

  if (!caller || !['owner', 'admin'].includes(caller.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check plan member limit
  const limitError = await checkMemberLimit(workspace.id);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 402 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = InviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Find or create user
  let [invitedUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!invitedUser) {
    [invitedUser] = await db.insert(users).values({ email }).returning();
  }

  // Check not already a member
  const [existing] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, invitedUser.id),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: 'User already a member' }, { status: 409 });
  }

  const [member] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId: workspace.id,
      userId: invitedUser.id,
      role,
    })
    .returning();

  // Send invite email
  const signInUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?email=${encodeURIComponent(email)}`;
  await resend.emails.send({
    from: 'invites@oncallkit.io',
    to: email,
    subject: `You've been invited to ${workspace.name} on OnCallKit`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔔 OnCallKit Invitation</h2>
        <p>You've been invited to join <strong>${workspace.name}</strong> as a ${role}.</p>
        <a href="${signInUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Accept Invitation
        </a>
      </div>
    `,
  }).catch(console.error);

  return NextResponse.json(member, { status: 201 });
}
