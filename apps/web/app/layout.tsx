import type { Metadata } from 'next';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'OnCallKit — On-Call Management for Indie SaaS',
  description:
    'Rotation schedules, escalation policies, multi-channel alerts. PagerDuty at $9/mo.',
  openGraph: {
    title: 'OnCallKit',
    description: 'On-call incident management for indie SaaS teams.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'OnCallKit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnCallKit',
    description: 'On-call incident management for indie SaaS — $9/mo',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
