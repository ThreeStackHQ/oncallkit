"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Activity, User, Clock, Plus, CheckCircle } from "lucide-react";

// Mock data
const chartData = [
  { day: "Feb 11", incidents: 1 },
  { day: "Feb 12", incidents: 0 },
  { day: "Feb 13", incidents: 2 },
  { day: "Feb 14", incidents: 1 },
  { day: "Feb 15", incidents: 3 },
  { day: "Feb 16", incidents: 0 },
  { day: "Feb 17", incidents: 1 },
  { day: "Feb 18", incidents: 0 },
  { day: "Feb 19", incidents: 2 },
  { day: "Feb 20", incidents: 1 },
  { day: "Feb 21", incidents: 0 },
  { day: "Feb 22", incidents: 4 },
  { day: "Feb 23", incidents: 2 },
  { day: "Feb 24", incidents: 1 },
  { day: "Feb 25", incidents: 0 },
  { day: "Feb 26", incidents: 3 },
  { day: "Feb 27", incidents: 2 },
  { day: "Feb 28", incidents: 1 },
  { day: "Mar 1", incidents: 0 },
  { day: "Mar 2", incidents: 2 },
  { day: "Mar 3", incidents: 1 },
  { day: "Mar 4", incidents: 3 },
  { day: "Mar 5", incidents: 0 },
  { day: "Mar 6", incidents: 1 },
  { day: "Mar 7", incidents: 2 },
  { day: "Mar 8", incidents: 1 },
  { day: "Mar 9", incidents: 0 },
  { day: "Mar 10", incidents: 2 },
  { day: "Mar 11", incidents: 1 },
  { day: "Mar 12", incidents: 2 },
];

type Severity = "CRITICAL" | "WARNING" | "INFO";
type Status = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  monitor: string;
  triggered: string;
  duration: string;
}

const incidents: Incident[] = [
  { id: "INC-001", title: "API response time > 5s", severity: "CRITICAL", status: "OPEN", monitor: "api-prod", triggered: "5m ago", duration: "5m" },
  { id: "INC-002", title: "Database connection pool exhausted", severity: "CRITICAL", status: "ACKNOWLEDGED", monitor: "db-primary", triggered: "22m ago", duration: "22m" },
  { id: "INC-003", title: "Memory usage > 85%", severity: "WARNING", status: "OPEN", monitor: "worker-01", triggered: "1h ago", duration: "1h" },
  { id: "INC-004", title: "SSL cert expiring in 7 days", severity: "INFO", status: "RESOLVED", monitor: "api-prod", triggered: "2h ago", duration: "15m" },
];

const severityConfig: Record<Severity, { label: string; className: string }> = {
  CRITICAL: { label: "🔴 CRITICAL", className: "bg-red-500/20 text-red-400 border border-red-500/30" },
  WARNING: { label: "🟡 WARNING", className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  INFO: { label: "🔵 INFO", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  OPEN: { label: "OPEN", className: "bg-red-500/20 text-red-400 border border-red-500/30" },
  ACKNOWLEDGED: { label: "ACK", className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  RESOLVED: { label: "RESOLVED", className: "bg-green-500/20 text-green-400 border border-green-500/30" },
};

const kpis = [
  {
    label: "Open Incidents",
    value: "2",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  {
    label: "Monitors Active",
    value: "8/8",
    icon: <Activity className="w-5 h-5" />,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
  },
  {
    label: "On-Call Now",
    value: "Sarah K.",
    icon: <User className="w-5 h-5" />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    label: "MTTR (7d)",
    value: "4m 32s",
    icon: <Clock className="w-5 h-5" />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">{kpi.label}</span>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: kpi.bg, color: kpi.color, border: `1px solid ${kpi.border}` }}
              >
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Incident Frequency Chart */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <h2 className="text-white font-semibold text-base mb-6">Incident Frequency (30 days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} interval={4} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#amber)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Incidents */}
      <div
        className="rounded-2xl border"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Recent Incidents</h2>
          <span className="text-xs text-slate-500">Last 24h</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Severity</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Monitor</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Triggered</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={inc.id} className={i < incidents.length - 1 ? "border-b border-white/5" : ""}>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{inc.title}</p>
                      <p className="text-xs text-slate-500">{inc.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityConfig[inc.severity].className}`}>
                      {severityConfig[inc.severity].label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusConfig[inc.status].className}`}>
                      {statusConfig[inc.status].label}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">{inc.monitor}</td>
                  <td className="p-4 text-sm text-slate-400">{inc.triggered}</td>
                  <td className="p-4 text-sm text-slate-400">{inc.duration}</td>
                  <td className="p-4">
                    {inc.status === "OPEN" && (
                      <button className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-slate-300 hover:border-amber-400/50 transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          Acknowledge Incident
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
        >
          <Plus className="w-4 h-4" />
          Add Monitor
        </button>
      </div>
    </div>
  );
}
