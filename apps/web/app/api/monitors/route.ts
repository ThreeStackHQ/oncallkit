import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { monitors } from '@oncallkit/db';
import { eq } from '@oncallkit/db';
import { z } from 'zod';
import { checkMonitorLimit } from '@/lib/planGuard';

export const dynamic = 'force-dynamic';

const CreateMonitorSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['http', 'tcp', 'ping']).default('http'),
  url: z.string().min(1),
  interval: z.number().int().min(30).max(3600).default(60),
  timeout: z.number().int().min(5).max(120).default(30),
  escalationPolicyId: z.string().uuid().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(monitors)
    .where(eq(monitors.workspaceId, workspaceId));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  // Check plan monitor limit
  const limitError = await checkMonitorLimit(workspaceId);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 402 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateMonitorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [monitor] = await db
    .insert(monitors)
    .values({ ...parsed.data, workspaceId })
    .returning();

  return NextResponse.json(monitor, { status: 201 });
}
