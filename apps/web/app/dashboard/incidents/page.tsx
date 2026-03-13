"use client";

import { useState } from "react";
import { X, Clock, User, AlertTriangle } from "lucide-react";

type Severity = "CRITICAL" | "WARNING" | "INFO";
type Status = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
type FilterTab = "All" | "Open" | "Acknowledged" | "Resolved";

interface TimelineEvent {
  time: string;
  event: string;
  actor?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  monitor: string;
  triggered: string;
  duration: string;
  assigned: string;
  created: string;
  timeline: TimelineEvent[];
}

const allIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "API response time > 5s",
    severity: "CRITICAL",
    status: "OPEN",
    monitor: "api-prod",
    triggered: "5m ago",
    duration: "5m",
    assigned: "Sarah K.",
    created: "Mar 12, 2026 03:41 UTC",
    timeline: [
      { time: "03:41:02", event: "Incident triggered by monitor api-prod" },
      { time: "03:41:03", event: "Escalation policy started: Eng On-Call" },
      { time: "03:41:05", event: "Email sent to sarah@company.com" },
      { time: "03:41:08", event: "Slack notification sent to #incidents" },
    ],
  },
  {
    id: "INC-002",
    title: "Database connection pool exhausted",
    severity: "CRITICAL",
    status: "ACKNOWLEDGED",
    monitor: "db-primary",
    triggered: "22m ago",
    duration: "22m",
    assigned: "Mike T.",
    created: "Mar 12, 2026 03:24 UTC",
    timeline: [
      { time: "03:24:15", event: "Incident triggered by monitor db-primary" },
      { time: "03:24:16", event: "Escalation policy started: Database Team" },
      { time: "03:24:18", event: "SMS sent to Mike T. (+1 555-0102)" },
      { time: "03:27:44", event: "Incident acknowledged", actor: "mike@company.com" },
    ],
  },
  {
    id: "INC-003",
    title: "Memory usage > 85%",
    severity: "WARNING",
    status: "OPEN",
    monitor: "worker-01",
    triggered: "1h ago",
    duration: "1h",
    assigned: "Sarah K.",
    created: "Mar 12, 2026 02:46 UTC",
    timeline: [
      { time: "02:46:33", event: "Incident triggered by monitor worker-01" },
      { time: "02:46:34", event: "Email sent to sarah@company.com" },
    ],
  },
  {
    id: "INC-004",
    title: "SSL cert expiring in 7 days",
    severity: "INFO",
    status: "RESOLVED",
    monitor: "api-prod",
    triggered: "2h ago",
    duration: "15m",
    assigned: "Sarah K.",
    created: "Mar 12, 2026 01:46 UTC",
    timeline: [
      { time: "01:46:00", event: "Incident triggered by monitor api-prod" },
      { time: "01:46:01", event: "Email sent to sarah@company.com" },
      { time: "01:51:22", event: "Incident acknowledged", actor: "sarah@company.com" },
      { time: "02:01:15", event: "Incident resolved", actor: "sarah@company.com" },
    ],
  },
  {
    id: "INC-005",
    title: "CDN cache miss rate spike",
    severity: "WARNING",
    status: "RESOLVED",
    monitor: "cdn-edge",
    triggered: "5h ago",
    duration: "8m",
    assigned: "Alex R.",
    created: "Mar 11, 2026 22:46 UTC",
    timeline: [
      { time: "22:46:10", event: "Incident triggered by monitor cdn-edge" },
      { time: "22:47:55", event: "Acknowledged", actor: "alex@company.com" },
      { time: "22:54:01", event: "Resolved", actor: "alex@company.com" },
    ],
  },
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

const tabs: FilterTab[] = ["All", "Open", "Acknowledged", "Resolved"];

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filtered = allIncidents.filter((inc) => {
    if (activeTab === "All") return true;
    if (activeTab === "Open") return inc.status === "OPEN";
    if (activeTab === "Acknowledged") return inc.status === "ACKNOWLEDGED";
    if (activeTab === "Resolved") return inc.status === "RESOLVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#13121f" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
            style={activeTab === tab ? { backgroundColor: "rgba(245,158,11,0.12)" } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Severity</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Monitor</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Triggered</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`cursor-pointer hover:bg-white/5 transition-colors ${i < filtered.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-200">{inc.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{inc.id}</p>
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
                  <td className="p-4 text-sm text-slate-400">{inc.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedIncident(null)} />
          <div
            className="relative w-full max-w-md h-full border-l border-white/10 flex flex-col overflow-y-auto"
            style={{ backgroundColor: "#13121f" }}
          >
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-mono mb-1">{selectedIncident.id}</p>
                <h2 className="text-white font-semibold text-lg leading-tight">{selectedIncident.title}</h2>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white mt-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Severity</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityConfig[selectedIncident.severity].className}`}>
                    {severityConfig[selectedIncident.severity].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusConfig[selectedIncident.status].className}`}>
                    {statusConfig[selectedIncident.status].label}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Assigned</p>
                    <p className="text-sm text-slate-300">{selectedIncident.assigned}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Created</p>
                    <p className="text-xs text-slate-300">{selectedIncident.created}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Event Timeline
                </h3>
                <div className="space-y-4">
                  {selectedIncident.timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                        {i < selectedIncident.timeline.length - 1 && (
                          <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: "rgba(245,158,11,0.2)" }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-mono text-slate-500 mb-0.5">{event.time}</p>
                        <p className="text-sm text-slate-300">{event.event}</p>
                        {event.actor && (
                          <p className="text-xs text-slate-500 mt-0.5">by {event.actor}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedIncident.status !== "RESOLVED" && (
                <div className="flex gap-3">
                  {selectedIncident.status === "OPEN" && (
                    <button
                      className="flex-1 py-2 rounded-lg text-sm font-medium border border-amber-400/30 transition-all hover:border-amber-400/60"
                      style={{ color: "#f59e0b" }}
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-green-400/30 text-green-400 hover:border-green-400/60 transition-all"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
