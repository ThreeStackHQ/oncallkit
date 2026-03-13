# OnCallKit 🔔

> On-call incident management for indie SaaS — PagerDuty at $9/mo.

**Wave 50 | ThreeStack**

## What it does

- 📅 **Rotation Schedules** — Weekly/daily/custom on-call rotations with timezone support
- 📣 **Escalation Policies** — Multi-step escalation with configurable delays
- 🚨 **Incident Management** — Trigger, acknowledge, resolve with full timeline
- 💬 **Multi-channel Alerts** — Email (Resend), SMS (Twilio), Slack webhooks
- 📡 **Monitor Integration** — HTTP/TCP/ping monitors that auto-trigger incidents
- 📊 **Incident Analytics** — MTTR, incident frequency, alert channel stats

## Pricing

| Plan | Price | Monitors | Team Members |
|------|-------|----------|--------------|
| Free | $0 | 3 | 1 |
| Pro | $9/mo | 25 | 10 |
| Team | $29/mo | Unlimited | Unlimited |

## Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript (strict)
- **Database:** PostgreSQL + Drizzle ORM
- **Queue:** Redis + BullMQ
- **Auth:** NextAuth.js (Google + Magic Link)
- **Payments:** Stripe
- **Email:** Resend
- **SMS:** Twilio
- **UI:** TailwindCSS + Radix UI

## Project Structure

\`\`\`
oncallkit/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       └── lib/                # Auth, Stripe, Redis, etc.
├── packages/
│   ├── db/                     # Drizzle schema + migrations
│   └── types/                  # Shared TypeScript types
└── .env.example                # Environment variables template
\`\`\`

## Development

\`\`\`bash
cp .env.example .env.local
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
\`\`\`

## Deployment

- **Production:** oncallkit.threestack.io (Coolify)
- **DNS:** A record → 46.62.246.46 (Cloudflare, proxied)

---

Built by [ThreeStack](https://threestack.io) 🚀
