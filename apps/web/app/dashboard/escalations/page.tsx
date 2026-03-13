"use client";

import { useState } from "react";
import { Plus, X, Trash2, ChevronDown } from "lucide-react";

type TargetType = "user" | "schedule" | "channel";
type Delay = "0" | "5" | "15" | "30";

interface EscalationStep {
  id: string;
  delay: Delay;
  targetType: TargetType;
  target: string;
}

interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  steps: EscalationStep[];
}

const policies: EscalationPolicy[] = [
  {
    id: "pol1",
    name: "Default Engineering",
    description: "Standard escalation for production incidents",
    steps: [
      { id: "s1", delay: "0", targetType: "schedule", target: "Engineering On-Call" },
      { id: "s2", delay: "5", targetType: "user", target: "Sarah K." },
      { id: "s3", delay: "15", targetType: "channel", target: "#incidents-critical" },
    ],
  },
  {
    id: "pol2",
    name: "Critical Alerts",
    description: "Immediate high-severity escalation",
    steps: [
      { id: "s1", delay: "0", targetType: "schedule", target: "Engineering On-Call" },
      { id: "s2", delay: "0", targetType: "channel", target: "#incidents-critical" },
      { id: "s3", delay: "5", targetType: "user", target: "Mike T." },
    ],
  },
  {
    id: "pol3",
    name: "Database Team",
    description: "For database-related incidents only",
    steps: [
      { id: "s1", delay: "0", targetType: "schedule", target: "Database On-Call" },
      { id: "s2", delay: "15", targetType: "user", target: "Mike T." },
    ],
  },
];

const delayLabels: Record<Delay, string> = {
  "0": "Immediately",
  "5": "After 5 min",
  "15": "After 15 min",
  "30": "After 30 min",
};

const targetTypeColors: Record<TargetType, string> = {
  user: "bg-blue-500/20 text-blue-400",
  schedule: "bg-purple-500/20 text-purple-400",
  channel: "bg-green-500/20 text-green-400",
};

type NewStep = Omit<EscalationStep, "id">;

export default function EscalationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [steps, setSteps] = useState<NewStep[]>([
    { delay: "0", targetType: "schedule", target: "" },
  ]);

  const addStep = () => {
    setSteps([...steps, { delay: "5", targetType: "user", target: "" }]);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const updateStep = (idx: number, updates: Partial<NewStep>) => {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{policies.length} policies configured</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      {/* Policy Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "#1a1929", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-white font-semibold text-base">{policy.name}</h3>
              <span className="text-xs text-slate-500 mt-0.5">{policy.steps.length} steps</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">{policy.description}</p>

            {/* Steps Preview */}
            <div className="space-y-2 mb-4">
              {policy.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500 shrink-0">{delayLabels[step.delay]}</span>
                    <span className="text-xs text-slate-600">→</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${targetTypeColors[step.targetType]}`}>
                      {step.targetType}
                    </span>
                    <span className="text-xs text-slate-300 truncate">{step.target}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10 hover:border-white/20 transition-colors">
                Edit
              </button>
              <button className="flex-1 py-1.5 rounded-lg text-xs text-red-400 border border-red-400/20 hover:border-red-400/40 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 my-8"
            style={{ backgroundColor: "#13121f" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Create Escalation Policy</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Policy Name</label>
                <input
                  type="text"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="Default Engineering"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={policyDesc}
                  onChange={(e) => setPolicyDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "#1a1929" }}
                />
              </div>

              {/* Steps Builder */}
              <div>
                <label className="block text-xs text-slate-400 mb-3">Escalation Steps</label>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-white/10 space-y-3"
                      style={{ backgroundColor: "#1a1929" }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                        >
                          {idx + 1}
                        </span>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(idx)}
                            className="text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Delay</label>
                          <div className="relative">
                            <select
                              value={step.delay}
                              onChange={(e) => updateStep(idx, { delay: e.target.value as Delay })}
                              className="w-full px-3 py-2 rounded-lg text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none appearance-none pr-8"
                              style={{ backgroundColor: "#13121f" }}
                            >
                              <option value="0">Immediately</option>
                              <option value="5">After 5 min</option>
                              <option value="15">After 15 min</option>
                              <option value="30">After 30 min</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Target Type</label>
                          <div className="relative">
                            <select
                              value={step.targetType}
                              onChange={(e) => updateStep(idx, { targetType: e.target.value as TargetType })}
                              className="w-full px-3 py-2 rounded-lg text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none appearance-none pr-8"
                              style={{ backgroundColor: "#13121f" }}
                            >
                              <option value="user">User</option>
                              <option value="schedule">Schedule</option>
                              <option value="channel">Channel</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Target</label>
                        <input
                          type="text"
                          value={step.target}
                          onChange={(e) => updateStep(idx, { target: e.target.value })}
                          placeholder={
                            step.targetType === "user"
                              ? "sarah@company.com"
                              : step.targetType === "schedule"
                              ? "Engineering On-Call"
                              : "#incidents-slack"
                          }
                          className="w-full px-3 py-2 rounded-lg text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none transition-colors"
                          style={{ backgroundColor: "#13121f" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addStep}
                  className="mt-3 w-full py-2 rounded-lg text-xs text-amber-400 border border-amber-400/20 hover:border-amber-400/40 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Step
                </button>
              </div>

              <div className="flex gap-3">
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
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
