"use client";

import { useState } from "react";
import { Plus, X, Users, Clock } from "lucide-react";

type ScheduleType = "Weekly" | "Daily";

interface Member {
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface Schedule {
  id: string;
  name: string;
  type: ScheduleType;
  timezone: string;
  members: Member[];
  currentOnCall: string;
}

const schedules: Schedule[] = [
  {
    id: "sch1",
    name: "Engineering On-Call",
    type: "Weekly",
    timezone: "UTC",
    currentOnCall: "Sarah K.",
    members: [
      { name: "Sarah K.", email: "sarah@company.com", initials: "SK", color: "#f59e0b" },
      { name: "Mike T.", email: "mike@company.com", initials: "MT", color: "#3b82f6" },
      { name: "Alex R.", email: "alex@company.com", initials: "AR", color: "#8b5cf6" },
      { name: "Jordan L.", email: "jordan@company.com", initials: "JL", color: "#ec4899" },
    ],
  },
  {
    id: "sch2",
    name: "Database On-Call",
    type: "Weekly",
    timezone: "America/New_York",
    currentOnCall: "Mike T.",
    members: [
      { name: "Mike T.", email: "mike@company.com", initials: "MT", color: "#3b82f6" },
      { name: "Chris B.", email: "chris@company.com", initials: "CB", color: "#22c55e" },
    ],
  },
  {
    id: "sch3",
    name: "Frontend Hotfix",
    type: "Daily",
    timezone: "Europe/London",
    currentOnCall: "Alex R.",
    members: [
      { name: "Alex R.", email: "alex@company.com", initials: "AR", color: "#8b5cf6" },
      { name: "Sam W.", email: "sam@company.com", initials: "SW", color: "#06b6d4" },
      { name: "Jordan L.", email: "jordan@company.com", initials: "JL", color: "#ec4899" },
    ],
  },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function SchedulesPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    timezone: "UTC",
    type: "Weekly" as ScheduleType,
    members: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{schedules.length} schedules active</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold text-base">{schedule.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                    {schedule.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {schedule.timezone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {schedule.members.length} members
                  </span>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  {schedule.members.map((member) => {
                    const isCurrent = member.name === schedule.currentOnCall;
                    return (
                      <div
                        key={member.email}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isCurrent ? "border" : ""}`}
                        style={
                          isCurrent
                            ? { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }
                            : {}
                        }
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCurrent ? "text-amber-400" : "text-slate-200"}`}>
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        </div>
                        {isCurrent && (
                          <span
                            className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                          >
                            ON-CALL NOW
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10 hover:border-white/20 transition-colors">
                  Edit
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-400/20 hover:border-red-400/40 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 p-6"
            style={{ backgroundColor: "#13121f" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Create Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Schedule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Engineering On-Call"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Rotation Type</label>
                <div className="flex gap-2">
                  {(["Weekly", "Daily"] as ScheduleType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        formData.type === t
                          ? "border-amber-400/50 text-amber-400"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                      style={formData.type === t ? { backgroundColor: "rgba(245,158,11,0.1)" } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Members (comma-separated emails)</label>
                <textarea
                  value={formData.members}
                  onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                  placeholder="sarah@company.com, mike@company.com"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors resize-none"
                  style={{ backgroundColor: "#1a1929" }}
                />
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
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
