"use client";

import { useState } from "react";
import { Plus, X, Mail, MessageSquare, Phone, Webhook, Edit2, Trash2, Zap } from "lucide-react";

type ChannelType = "Email" | "Slack" | "SMS" | "Webhook";

interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  config: string;
  enabled: boolean;
}

const channels: Channel[] = [
  { id: "ch1", type: "Email", name: "Engineering Alerts", config: "team-oncall@company.com", enabled: true },
  { id: "ch2", type: "Email", name: "Ops Team", config: "ops@company.com", enabled: true },
  { id: "ch3", type: "Slack", name: "#incidents-critical", config: "https://hooks.slack.com/services/T0.../B0.../xxx", enabled: true },
  { id: "ch4", type: "Slack", name: "#alerts-warning", config: "https://hooks.slack.com/services/T0.../B1.../yyy", enabled: false },
  { id: "ch5", type: "SMS", name: "Sarah's Phone", config: "+1 (555) 010-2030", enabled: true },
  { id: "ch6", type: "SMS", name: "Mike's Phone", config: "+1 (555) 010-2031", enabled: true },
  { id: "ch7", type: "Webhook", name: "PagerDuty Relay", config: "https://events.pagerduty.com/v2/enqueue", enabled: true },
  { id: "ch8", type: "Webhook", name: "Internal Alertmanager", config: "https://alertmanager.internal/api/v1/alerts", enabled: false },
];

const typeConfig: Record<ChannelType, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  Email: {
    icon: <Mail className="w-5 h-5" />,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
  },
  Slack: {
    icon: <MessageSquare className="w-5 h-5" />,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.3)",
  },
  SMS: {
    icon: <Phone className="w-5 h-5" />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
  },
  Webhook: {
    icon: <Webhook className="w-5 h-5" />,
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
  },
};

export default function ChannelsPage() {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<ChannelType>("Email");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    slackWebhook: "",
    phone: "",
    webhookUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  const groupedChannels = (["Email", "Slack", "SMS", "Webhook"] as ChannelType[]).map((type) => ({
    type,
    channels: channels.filter((c) => c.type === type),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{channels.filter((c) => c.enabled).length} active channels</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {/* Channel Groups */}
      {groupedChannels.map(({ type, channels: typeChannels }) => {
        const cfg = typeConfig[type];
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.icon}
              </div>
              <h3 className="text-white font-semibold">{type}</h3>
              <span className="text-xs text-slate-500">({typeChannels.length})</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {typeChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`rounded-2xl border p-5 ${channel.enabled ? "" : "opacity-50"}`}
                  style={{ backgroundColor: "#1a1929", borderColor: channel.enabled ? cfg.border : "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium text-sm">{channel.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">
                        {channel.config}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        channel.enabled ? "text-green-400 bg-green-400/10" : "text-slate-500 bg-slate-700"
                      }`}
                    >
                      {channel.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border border-white/10 text-slate-300 hover:border-amber-400/50 hover:text-amber-400 transition-all"
                    >
                      <Zap className="w-3 h-3" />
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 p-6"
            style={{ backgroundColor: "#13121f" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Add Alert Channel</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Channel Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Email", "Slack", "SMS", "Webhook"] as ChannelType[]).map((t) => {
                    const c = typeConfig[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormType(t)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          formType === t ? "text-white" : "text-slate-400 border-white/10 hover:border-white/20"
                        }`}
                        style={
                          formType === t
                            ? { backgroundColor: c.bg, borderColor: c.border, color: c.color }
                            : {}
                        }
                      >
                        <span style={formType === t ? { color: c.color } : {}}>{c.icon}</span>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Channel Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formType === "Email" ? "Engineering Alerts" :
                    formType === "Slack" ? "#incidents-critical" :
                    formType === "SMS" ? "Sarah's Phone" :
                    "Internal Webhook"
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>

              {/* Type-specific fields */}
              {formType === "Email" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="team@company.com"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  />
                </div>
              )}

              {formType === "Slack" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Slack Webhook URL</label>
                  <input
                    type="url"
                    value={formData.slackWebhook}
                    onChange={(e) => setFormData({ ...formData, slackWebhook: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  />
                </div>
              )}

              {formType === "SMS" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  />
                </div>
              )}

              {formType === "Webhook" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="https://your-service.com/webhook"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1929" }}
                  />
                </div>
              )}

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
                  Add Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
