import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { alertChannels } from '@oncallkit/db';
import { eq, and } from '@oncallkit/db';
import { resend, sendIncidentAlert } from '@/lib/resend';
import { sendSMSAlert } from '@/lib/twilio';

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

  const config = channel.config as Record<string, string>;
  const testIncident = {
    title: 'Test Alert',
    severity: 'info',
    incidentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/incidents`,
  };

  try {
    switch (channel.type) {
      case 'email': {
        await sendIncidentAlert({
          to: config.email,
          incidentTitle: testIncident.title,
          severity: testIncident.severity,
          incidentUrl: testIncident.incidentUrl,
        });
        break;
      }
      case 'sms': {
        await sendSMSAlert({
          to: config.phoneNumber,
          incidentTitle: testIncident.title,
          severity: testIncident.severity,
        });
        break;
      }
      case 'slack': {
        await fetch(config.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `🔔 *OnCallKit Test Alert*\n*Incident:* ${testIncident.title}\n*Severity:* ${testIncident.severity}`,
                },
              },
            ],
          }),
        });
        break;
      }
      case 'webhook': {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'test',
            incident: testIncident,
            triggeredAt: new Date().toISOString(),
          }),
        });
        break;
      }
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Test failed: ${message}` }, { status: 500 });
  }
}
