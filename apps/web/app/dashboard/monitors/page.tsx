"use client";

import { useState } from "react";
import {
  Plus,
  X,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type MonitorType = "HTTP" | "TCP" | "PING";
type MonitorStatus = "UP" | "DOWN";

interface CheckHistory {
  time: string;
  status: MonitorStatus;
  responseMs: number;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  status: MonitorStatus;
  lastCheck: string;
  avgResponseMs: number;
  uptime24h: { hour: string; ms: number }[];
  recentChecks: CheckHistory[];
}

const monitors: Monitor[] = [
  {
    id: "m1",
    name: "API Production",
    url: "https://api.company.com/health",
    type: "HTTP",
    status: "UP",
    lastCheck: "30s ago",
    avgResponseMs: 142,
    uptime24h: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, ms: 120 + Math.floor(Math.random() * 80) })),
    recentChecks: [
      { time: "03:46:00", status: "UP", responseMs: 138 },
      { time: "03:45:00", status: "UP", responseMs: 145 },
      { time: "03:44:00", status: "UP", responseMs: 152 },
      { time: "03:43:00", status: "UP", responseMs: 139 },
      { time: "03:42:00", status: "UP", responseMs: 148 },
    ],
  },
  {
    id: "m2",
    name: "Database Primary",
    url: "db.company.com:5432",
    type: "TCP",
    status: "UP",
    lastCheck: "1m ago",
    avgResponseMs: 8,
    uptime24h: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, ms: 5 + Math.floor(Math.random() * 10) })),
    recentChecks: [
      { time: "03:46:00", status: "UP", responseMs: 7 },
      { time: "03:45:00", status: "UP", responseMs: 9 },
      { time: "03:44:00", status: "DOWN", responseMs: 0 },
      { time: "03:43:00", status: "UP", responseMs: 8 },
      { time: "03:42:00", status: "UP", responseMs: 6 },
    ],
  },
  {
    id: "m3",
    name: "CDN Edge Node",
    url: "cdn.company.com",
    type: "HTTP",
    status: "UP",
    lastCheck: "45s ago",
    avgResponseMs: 23,
    uptime24h: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, ms: 15 + Math.floor(Math.random() * 20) })),
    recentChecks: [
      { time: "03:46:00", status: "UP", responseMs: 22 },
      { time: "03:45:00", status: "UP", responseMs: 25 },
      { time: "03:44:00", status: "UP", responseMs: 21 },
      { time: "03:43:00", status: "UP", responseMs: 24 },
    ],
  },
  {
    id: "m4",
    name: "Worker Node 01",
    url: "worker-01.internal",
    type: "PING",
    status: "DOWN",
    lastCheck: "2m ago",
    avgResponseMs: 0,
    uptime24h: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, ms: i < 20 ? 10 + Math.floor(Math.random() * 5) : 0 })),
    recentChecks: [
      { time: "03:46:00", status: "DOWN", responseMs: 0 },
      { time: "03:45:00", status: "DOWN", responseMs: 0 },
      { time: "03:44:00", status: "UP", responseMs: 12 },
      { time: "03:43:00", status: "UP", responseMs: 11 },
    ],
  },
];

const typeColors: Record<MonitorType, string> = {
  HTTP: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  TCP: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  PING: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function MonitorsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    type: "HTTP",
    interval: "60",
    timeout: "10",
    escalation: "Default",
  });

  const toggleExpanded = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {monitors.filter((m) => m.status === "UP").length}/{monitors.length} monitors UP
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
        >
          <Plus className="w-4 h-4" />
          Add Monitor
        </button>
      </div>

      {/* Monitor Cards */}
      <div className="space-y-4">
        {monitors.map((monitor) => (
          <div
            key={monitor.id}
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleExpanded(monitor.id)}
            >
              <div className="flex items-center gap-4">
                {monitor.status === "UP" ? (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-white font-semibold text-sm">{monitor.name}</h3>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">{monitor.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColors[monitor.type]}`}>
                  {monitor.type}
                </span>
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {monitor.lastCheck}
                </div>
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-bold ${monitor.status === "UP" ? "text-green-400" : "text-red-400"}`}>
                    {monitor.status === "UP" ? `${monitor.avgResponseMs}ms` : "DOWN"}
                  </p>
                </div>
                {expanded === monitor.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {expanded === monitor.id && (
              <div className="border-t border-white/10 p-5 space-y-6">
                {/* 24h Chart */}
                <div>
                  <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">24h Response Time</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={monitor.uptime24h}>
                      <defs>
                        <linearGradient id={`grad-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                        labelStyle={{ color: "#e2e8f0" }}
                        itemStyle={{ color: "#f59e0b" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ms"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill={`url(#grad-${monitor.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Checks */}
                <div>
                  <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">Recent Checks</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left pb-2 text-xs text-slate-500">Time</th>
                        <th className="text-left pb-2 text-xs text-slate-500">Status</th>
                        <th className="text-left pb-2 text-xs text-slate-500">Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitor.recentChecks.map((check, i) => (
                        <tr key={i} className={i < monitor.recentChecks.length - 1 ? "border-b border-white/5" : ""}>
                          <td className="py-2 text-xs font-mono text-slate-400">{check.time}</td>
                          <td className="py-2">
                            <span className={`text-xs font-medium ${check.status === "UP" ? "text-green-400" : "text-red-400"}`}>
                              {check.status}
                            </span>
                          </td>
                          <td className="py-2 text-xs text-slate-400">
                            {check.responseMs > 0 ? `${check.responseMs}ms` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Monitor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 p-6"
            style={{ backgroundColor: "#13121f" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Add Monitor</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Monitor Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My API Monitor"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">URL / Host</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://api.example.com/health"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  >
                    <option>HTTP</option>
                    <option>TCP</option>
                    <option>PING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Interval (s)</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  >
                    <option value="30">30s</option>
                    <option value="60">60s</option>
                    <option value="120">2m</option>
                    <option value="300">5m</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Timeout (s)</label>
                  <input
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Escalation Policy</label>
                  <select
                    value={formData.escalation}
                    onChange={(e) => setFormData({ ...formData, escalation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  >
                    <option>Default</option>
                    <option>Critical Alerts</option>
                    <option>Database Team</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-slate-400 border border-white/10 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
                >
                  Add Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
