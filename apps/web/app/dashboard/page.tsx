export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">OnCallKit Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome — your on-call hub is ready.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Open Incidents', value: '0', color: 'text-red-400' },
          { label: 'Monitors Active', value: '0', color: 'text-green-400' },
          { label: 'On-Call Now', value: '—', color: 'text-amber-400' },
          { label: 'MTTR (7d)', value: '—', color: 'text-blue-400' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#1a1830] border border-slate-800 rounded-xl p-5"
          >
            <div className={`text-3xl font-bold mb-1 ${card.color}`}>
              {card.value}
            </div>
            <div className="text-slate-400 text-sm">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-[#1a1830] border border-slate-800 rounded-xl p-12 text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-white font-semibold mb-2">No incidents yet</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Add a monitor and configure your escalation policy to start receiving
          on-call alerts.
        </p>
      </div>
    </div>
  );
}
