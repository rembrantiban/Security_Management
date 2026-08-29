import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import IncidentSummaryDashboard from "@/components/Dashboard/IncidentSummaryDashboard";
import ActivityTimeline from "@/components/Dashboard/ActivityTimeline";
import PendingRequestsTable from "@/components/Dashboard/PendingRequestsTable";
import SystemStatus from "@/components/Dashboard/SystemStatus";
//import ViewIncidentStatistics from "@/components/Dashboard/ViewIncidentStatistics";
import ViewSecurityAnalytics from "@/components/Dashboard/ViewSecurityAnalytics";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-2">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

        {/* Ambient wash */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-amber-950/40 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Security Management Dashboard
            </span>

            <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-white">
              Welcome back, {user?.first_name || "User"}
            </h1>

            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
              Real-time analytics, personnel activity, incidents, and campus
              surveillance — all in one place.
            </p>
          </div>

          <Button className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50">
            <Download className="h-3.5 w-3.5" />
            Export report
          </Button>

        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="1,245"
          icon={<Users className="h-4 w-4" />}
          accent="bg-blue-50 text-blue-600 ring-blue-100"
        />
        <StatCard
          title="Active Guards"
          value="32"
          icon={<Shield className="h-4 w-4" />}
          accent="bg-emerald-50 text-emerald-600 ring-emerald-100"
        />
        <StatCard
          title="Incidents"
          value="8"
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="bg-red-50 text-red-600 ring-red-100"
        />
        <StatCard
          title="Logs Today"
          value="356"
          icon={<FileText className="h-4 w-4" />}
          accent="bg-amber-50 text-amber-700 ring-amber-100"
        />
      </div>

      <div className="grid items-start gap-2 lg:grid-cols-2">
        <SystemStatus />
        <ViewSecurityAnalytics />
      </div>

      <div className="grid items-start gap-2 lg:grid-cols-2">
        <IncidentSummaryDashboard />
        <ActivityTimeline />
      </div>

      <PendingRequestsTable />

    </div>
  );
}

/* 🔹 COMPONENTS */

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-700">
          {title}
        </p>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${accent}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}