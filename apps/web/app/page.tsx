"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  GitBranch,
  Radio,
  Clock,
  BarChart3,
  Plug,
  Check,
  X,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-6 h-6 text-amber-400" />,
    title: "Rotation Schedules",
    desc: "Build flexible on-call rotations — daily, weekly, or custom. Drag-and-drop team management with override support.",
  },
  {
    icon: <GitBranch className="w-6 h-6 text-amber-400" />,
    title: "Escalation Policies",
    desc: "Multi-step escalation chains with configurable delays. Auto-escalate when incidents go unacknowledged.",
  },
  {
    icon: <Radio className="w-6 h-6 text-amber-400" />,
    title: "Multi-Channel Alerts",
    desc: "Notify via Email, SMS, Slack, PagerDuty webhook, or custom webhooks. Reach the right person every time.",
  },
  {
    icon: <Clock className="w-6 h-6 text-amber-400" />,
    title: "Incident Timeline",
    desc: "Full audit trail from trigger to resolution. See every notification, acknowledgment, and action in one view.",
  },
  {
    icon: <Plug className="w-6 h-6 text-amber-400" />,
    title: "Monitor Integration",
    desc: "Works with Datadog, UptimeRobot, Grafana, and any HTTP-based monitoring tool via webhook triggers.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
    title: "MTTR Analytics",
    desc: "Track mean time to resolution, incident frequency, and team response times. Improve your SLA with data.",
  },
];

const steps = [
  {
    num: "01",
    title: "Monitor Fails",
    desc: "Your monitoring tool detects an issue and sends a webhook to OnCallKit's trigger endpoint.",
  },
  {
    num: "02",
    title: "Incident Triggered",
    desc: "OnCallKit creates an incident, determines who is on-call, and starts the escalation policy.",
  },
  {
    num: "03",
    title: "Team Notified in 30s",
    desc: "The on-call engineer is alerted across all configured channels. If no ACK, it escalates automatically.",
  },
];

type ComparisonRow = {
  feature: string;
  oncall: boolean | string;
  pagerduty: boolean | string;
  opsgenie: boolean | string;
};

const comparisonRows: ComparisonRow[] = [
  { feature: "On-Call Schedules", oncall: true, pagerduty: true, opsgenie: true },
  { feature: "Escalation Policies", oncall: true, pagerduty: true, opsgenie: true },
  { feature: "Email / SMS / Slack", oncall: true, pagerduty: true, opsgenie: true },
  { feature: "Incident Timeline", oncall: true, pagerduty: true, opsgenie: false },
  { feature: "MTTR Analytics", oncall: true, pagerduty: true, opsgenie: false },
  { feature: "Simple Flat Pricing", oncall: true, pagerduty: false, opsgenie: false },
  { feature: "Price", oncall: "$9/mo", pagerduty: "$19+/user", opsgenie: "$9+/user" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started with essentials",
    features: ["3 monitors", "1 user", "Email alerts only", "Basic schedules", "Community support"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    desc: "Everything teams need to stay on-call",
    features: [
      "25 monitors",
      "10 users",
      "All channels (Email, SMS, Slack, Webhook)",
      "Escalation policies",
      "MTTR analytics",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    desc: "For growing engineering orgs",
    features: [
      "Unlimited monitors",
      "Unlimited users",
      "All channels",
      "Custom integrations",
      "Audit logs",
      "SLA reports",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-amber-400 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-600 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-slate-300">{value}</span>;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#0f0e1a", color: "#e2e8f0", minHeight: "100vh" }}>
      {/* Sticky Nav */}
      <nav
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md"
        style={{ backgroundColor: "rgba(15,14,26,0.9)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span className="text-lg font-bold text-white">OnCallKit</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-sm text-slate-400 hover:text-white transition-colors">Docs</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm text-slate-300 border border-white/20 rounded-lg hover:border-white/40 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden text-slate-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 border-t border-white/10">
            <a href="#features" className="text-sm text-slate-400 py-2">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 py-2">Pricing</a>
            <a href="#docs" className="text-sm text-slate-400 py-2">Docs</a>
            <a href="/dashboard" className="text-sm text-slate-300 py-2">Sign In</a>
            <a href="/dashboard" className="text-sm font-semibold py-2 px-4 rounded-lg text-center" style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}>
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border border-amber-400/30" style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Now in public beta — free to try
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Never{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            miss an incident.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          On-call scheduling, escalation policies, and multi-channel alerting — for teams that ship fast.{" "}
          <span className="text-amber-400 font-semibold">$9/mo.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/dashboard"
            className="px-8 py-4 text-base font-bold rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
          >
            Start for Free
            <ChevronRight className="inline w-5 h-5 ml-1" />
          </a>
          <a
            href="#features"
            className="px-8 py-4 text-base font-semibold rounded-xl border border-white/20 text-slate-300 hover:border-amber-400/50 transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Terminal Card */}
        <div
          className="max-w-2xl mx-auto rounded-2xl border border-white/10 overflow-hidden text-left"
          style={{ backgroundColor: "#13121f" }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-slate-500 font-mono">trigger-incident.sh</span>
          </div>
          <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
            <span className="text-slate-500">$ </span>
            <span className="text-amber-400">curl</span>
            {" -X POST https://api.oncallkit.threestack.io/v1/trigger \\\n"}
            {"  -d "}
            <span className="text-green-400">
              {`'{"monitor":"api-prod","severity":"critical"}'`}
            </span>
            {"\n\n"}
            <span className="text-slate-500">{"# Response:"}</span>
            {"\n"}
            <span className="text-slate-300">{`{`}</span>
            {"\n"}
            <span className="text-blue-400">{"  \"incident_id\""}</span>
            {`: `}
            <span className="text-green-400">{`"inc_01HZ8XKFP3"`}</span>
            {`,\n`}
            <span className="text-blue-400">{"  \"status\""}</span>
            {`: `}
            <span className="text-green-400">{`"triggered"`}</span>
            {`,\n`}
            <span className="text-blue-400">{"  \"on_call\""}</span>
            {`: `}
            <span className="text-green-400">{`"sarah@company.com"`}</span>
            {`,\n`}
            <span className="text-blue-400">{"  \"notified_in_ms\""}</span>
            {`: `}
            <span className="text-amber-400">{`847`}</span>
            {"\n}"}
          </pre>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need for on-call</h2>
          <p className="text-slate-400 text-lg">Built by engineers who lived through 3 AM pages.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all group"
              style={{ backgroundColor: "#1a1929" }}
            >
              <div className="mb-4 p-2 w-fit rounded-lg" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-amber-300 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: "#13121f" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">From monitor failure to team notification in under 30 seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-6 border"
                  style={{ backgroundColor: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.4)", color: "#f59e0b" }}
                >
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5" style={{ backgroundColor: "rgba(245,158,11,0.2)" }} />
                )}
                <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How we compare</h2>
          <p className="text-slate-400 text-lg">More features. Simpler pricing. No per-seat surprises.</p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ backgroundColor: "#1a1929" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-slate-400 font-medium text-sm">Feature</th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">OnCallKit</span>
                  </div>
                </th>
                <th className="p-4 text-center text-slate-400 font-medium text-sm">PagerDuty</th>
                <th className="p-4 text-center text-slate-400 font-medium text-sm">OpsGenie</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-white/5" : ""}>
                  <td className="p-4 text-slate-300 text-sm">{row.feature}</td>
                  <td className="p-4 text-center">
                    <Cell value={row.oncall} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.pagerduty} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.opsgenie} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20" style={{ backgroundColor: "#13121f" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400 text-lg">No per-seat traps. No surprise overages.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? "border-amber-400 scale-105"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{ backgroundColor: plan.highlight ? "#1a1929" : "#1a1929" }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-400">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <a
                  href="/dashboard"
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "hover:opacity-90"
                      : "border border-white/20 text-slate-300 hover:border-amber-400/50"
                  }`}
                  style={plan.highlight ? { backgroundColor: "#f59e0b", color: "#0f0e1a" } : {}}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div
          className="rounded-3xl p-12 text-center border border-amber-400/20"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(15,14,26,0) 100%)" }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Start for free.{" "}
            <span style={{ color: "#f59e0b" }}>Be on-call in minutes.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Set up your first monitor, schedule, and escalation policy in under 5 minutes. No credit card required.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
          >
            Get Started Free
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12" style={{ backgroundColor: "#13121f" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <span className="text-white font-bold">OnCallKit</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">
                On-call infrastructure for teams that ship fast. Built by ThreeStack.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
                <ul className="space-y-2">
                  {["Features", "Pricing", "Changelog", "Roadmap"].map((l) => (
                    <li key={l}><a href="#" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Developers</h4>
                <ul className="space-y-2">
                  {["Docs", "API Reference", "Webhooks", "SDKs"].map((l) => (
                    <li key={l}><a href="#" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
                <ul className="space-y-2">
                  {["About", "Blog", "Privacy", "Terms"].map((l) => (
                    <li key={l}><a href="#" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2026 ThreeStack. All rights reserved.</p>
            <p className="text-slate-600 text-sm">Made with ❤️ for SRE teams everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
