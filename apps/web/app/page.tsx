import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f0e1a] text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">🔔</span>
          </div>
          <h1 className="text-3xl font-bold">OnCallKit</h1>
        </div>
        <h2 className="text-5xl font-bold">
          On-call management
          <br />
          <span className="text-amber-400">for indie SaaS.</span>
        </h2>
        <p className="text-slate-400 text-xl max-w-lg mx-auto">
          Rotation schedules, escalation policies, multi-channel alerts.
          PagerDuty at $9/mo.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/dashboard"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="#pricing"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-slate-600 text-sm mt-8">
          Landing page coming soon — scaffold complete ✓
        </p>
      </div>
    </main>
  );
}
