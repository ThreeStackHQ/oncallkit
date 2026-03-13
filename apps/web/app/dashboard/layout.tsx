"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Calendar,
  GitBranch,
  Radio,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/dashboard/monitors", label: "Monitors", icon: Activity },
  { href: "/dashboard/schedules", label: "Schedules", icon: Calendar },
  { href: "/dashboard/escalations", label: "Escalations", icon: GitBranch },
  { href: "/dashboard/channels", label: "Alert Channels", icon: Radio },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/incidents": "Incidents",
  "/dashboard/monitors": "Monitors",
  "/dashboard/schedules": "On-Call Schedules",
  "/dashboard/escalations": "Escalation Policies",
  "/dashboard/channels": "Alert Channels",
  "/dashboard/billing": "Billing",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          <span className="text-white font-bold text-lg">OnCallKit</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              style={active ? { backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b" } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#0f0e1a" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/10"
        style={{ backgroundColor: "#13121f" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative w-64 h-full border-r border-white/10 flex flex-col"
            style={{ backgroundColor: "#13121f" }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0"
          style={{ backgroundColor: "#13121f" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold text-lg">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              OnCallKit Pro
            </span>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#f59e0b", color: "#0f0e1a" }}
              >
                SK
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
