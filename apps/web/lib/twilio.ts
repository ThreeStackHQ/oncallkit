import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export async function sendSMSAlert({
  to,
  incidentTitle,
  severity,
}: {
  to: string;
  incidentTitle: string;
  severity: string;
}) {
  return twilioClient.messages.create({
    body: `[OnCallKit ${severity.toUpperCase()}] Incident: ${incidentTitle}. Open your dashboard to acknowledge.`,
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
  });
}
