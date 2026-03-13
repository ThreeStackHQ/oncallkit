"use client";

import { CreditCard, Activity, Users, Bell, ExternalLink, ArrowUpRight } from "lucide-react";

interface UsageMeter {
  label: string;
  used: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}

const usageMeters: UsageMeter[] = [
  {
    label: "Monitors",
    used: 8,
    total: 25,
    icon: <Activity className="w-4 h-4" />,
    color: "#f59e0b",
  },
  {
    label: "Team Members",
    used: 3,
    total: 10,
    icon: <Users className="w-4 h-4" />,
    color: "#3b82f6",
  },
];

const invoices = [
  { date: "Mar 1, 2026", amount: "$9.00", status: "Paid" },
  { date: "Feb 1, 2026", amount: "$9.00", status: "Paid" },
  { date: "Jan 1, 2026", amount: "$9.00", status: "Paid" },
];

export default function BillingPage() {
  const handleUpgrade = async () => {
    // POST /api/stripe/checkout
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "team" }),
    });
    if (response.ok) {
      const data = (await response.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    }
  };

  const handleManageBilling = () => {
    // In production: redirect to Stripe billing portal
    window.open("https://billing.stripe.com/p/login/test", "_blank");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Current Plan */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "#1a1929",
          borderColor: "rgba(245,158,11,0.3)",
          background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, #1a1929 60%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-white font-bold text-xl">OnCallKit Pro</h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
              >
                ACTIVE
              </span>
            </div>
            <p className="text-slate-400 text-sm">Next billing date: <span className="text-slate-300">April 1, 2026</span></p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-white">$9<span className="text-base text-slate-400 font-normal">/mo</span></p>
            <p className="text-xs text-slate-500 mt-0.5">Billed monthly</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleManageBilling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/20 text-slate-300 hover:border-white/40 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Manage Billing
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={handleUpgrade}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
          >
            <ArrowUpRight className="w-4 h-4" />
            Upgrade to Team
          </button>
        </div>
      </div>

      {/* Usage Meters */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white font-semibold text-base mb-6">Usage This Month</h3>

        <div className="space-y-6">
          {usageMeters.map((meter) => {
            const pct = Math.round((meter.used / meter.total) * 100);
            return (
              <div key={meter.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span style={{ color: meter.color }}>{meter.icon}</span>
                    {meter.label}
                  </div>
                  <span className="text-sm text-slate-400">
                    <span className="text-white font-medium">{meter.used}</span>
                    <span className="text-slate-600"> / {meter.total}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: meter.color }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{pct}% used</p>
              </div>
            );
          })}

          {/* Alerts (no limit on Pro) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Bell className="w-4 h-4 text-purple-400" />
                Alerts Sent
              </div>
              <span className="text-sm text-slate-400">
                <span className="text-white font-medium">142</span>
                <span className="text-slate-600"> sent</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: "57%", backgroundColor: "#a855f7" }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Unlimited on Pro plan</p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Need more capacity?</h3>
            <p className="text-slate-400 text-sm">Upgrade to Team for unlimited monitors, users, and advanced features.</p>
          </div>
          <div className="shrink-0">
            <div
              className="rounded-xl p-4 text-center min-w-[160px]"
              style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-xs text-slate-400 mb-1">Team Plan</p>
              <p className="text-2xl font-extrabold text-white">$29<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <button
                onClick={handleUpgrade}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div
        className="rounded-2xl border"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Billing History</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase tracking-wide">Date</th>
              <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase tracking-wide">Amount</th>
              <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase tracking-wide">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i} className={i < invoices.length - 1 ? "border-b border-white/5" : ""}>
                <td className="p-4 text-sm text-slate-300">{inv.date}</td>
                <td className="p-4 text-sm text-slate-300 font-medium">{inv.amount}</td>
                <td className="p-4">
                  <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-xs text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 ml-auto">
                    <ExternalLink className="w-3 h-3" />
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
