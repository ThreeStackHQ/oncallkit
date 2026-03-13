import { Resend } from 'resend';

let _resend: Resend | null = null;
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    if (!_resend) {
      _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return (_resend as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function sendIncidentAlert({
  to,
  incidentTitle,
  severity,
  incidentUrl,
}: {
  to: string;
  incidentTitle: string;
  severity: string;
  incidentUrl: string;
}) {
  return resend.emails.send({
    from: 'alerts@oncallkit.io',
    to,
    subject: `[${severity.toUpperCase()}] Incident: ${incidentTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔔 OnCallKit Alert</h2>
        <p><strong>Incident:</strong> ${incidentTitle}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <a href="${incidentUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          View Incident
        </a>
      </div>
    `,
  });
}
