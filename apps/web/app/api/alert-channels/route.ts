import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { alertChannels } from '@oncallkit/db';
import { eq } from '@oncallkit/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateChannelSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['email', 'slack', 'sms', 'webhook']),
  config: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const rows = await db
    .select()
    .from(alertChannels)
    .where(eq(alertChannels.workspaceId, workspaceId));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId: string }).workspaceId;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateChannelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [channel] = await db
    .insert(alertChannels)
    .values({
      workspaceId,
      name: parsed.data.name,
      type: parsed.data.type,
      config: parsed.data.config,
    })
    .returning();

  return NextResponse.json(channel, { status: 201 });
}
