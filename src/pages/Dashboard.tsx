import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useActivityStore } from "@/store/useActivityStore";
import IncidentSummaryDashboard from "@/components/Dashboard/IncidentSummaryDashboard";
import ActivityTimeline from "@/components/Dashboard/ActivityTimeline";
import ActiveAlertsNotifications from "@/components/Dashboard/ActiveAlertsNotifications";
import PendingRequestsTable from "@/components/Dashboard/PendingRequestsTable";
import SystemStatus from "@/components/Dashboard/SystemStatus";
//import ViewIncidentStatistics from "@/components/Dashboard/ViewIncidentStatistics";
import ViewSecurityAnalytics from "@/components/Dashboard/ViewSecurityAnalytics";

import PageHeader from "@/components/layout/PageHeader";

/** Staff roles excluded from the "Total Users" count on the dashboard. */
const EXCLUDED_USER_ROLES = ["Administrator", "IT System Administrator"];

export default function Dashboard() {
  const { user, users, getAllUsers } = useAuth();
  const { incidents } = useIncidentReport();
  const { logs, getActivityLogs } = useActivityStore();

  useEffect(() => {
    getAllUsers();
    getActivityLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUsers = useMemo(
    () =>
      users.filter((u) => !EXCLUDED_USER_ROLES.includes(u.role)).length,
    [users]
  );

  const activeIncidents = useMemo(
    () => incidents.filter((i) => i.status === "In Progress").length,
    [incidents]
  );

  const pendingIncidents = useMemo(
    () => incidents.filter((i) => i.status === "Pending").length,
    [incidents]
  );

  const criticalOpenIncidents = useMemo(
    () =>
      incidents.filter(
        (i) =>
          i.severity === "Critical" &&
          (i.status === "Pending" || i.status === "In Progress")
      ).length,
    [incidents]
  );

  const logsCount = logs.length;

  return (
    <div className="space-y-2">

      {/* HEADER */}
      <PageHeader
        eyebrow="Administrator"
        title={`Welcome back, ${user?.first_name || "User"}`}
        description="Analytics, personnel activity, incidents, and campus surveillance in one place."
        actions={
          <OperationsSummary
            pending={pendingIncidents}
            active={activeIncidents}
            critical={criticalOpenIncidents}
          />
        }
      />

      {/* KPI CARDS */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          accent="bg-blue-50 text-blue-600 ring-blue-100"
        />
        <StatCard
          title="Active Incidents"
          value={activeIncidents.toLocaleString()}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="bg-orange-50 text-orange-600 ring-orange-100"
        />
        <StatCard
          title="Pending Incidents"
          value={pendingIncidents.toLocaleString()}
          icon={<Clock className="h-4 w-4" />}
          accent="bg-red-50 text-red-600 ring-red-100"
        />
        <StatCard
          title="Activity Logs"
          value={logsCount.toLocaleString()}
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

      {/* 3.5 — Active alerts & notifications, and pending requests */}
      <div className="grid items-start gap-2 lg:grid-cols-2">
        <ActiveAlertsNotifications />
        <PendingRequestsTable />
      </div>

    </div>
  );
}

/* 🔹 COMPONENTS */

/** Current local time, refreshed every 30 seconds. */
function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

/**
 * Header summary: local time and the campus incident status at a glance,
 * derived from the incidents already loaded for the dashboard.
 */
function OperationsSummary({
  pending,
  active,
  critical,
}: {
  pending: number;
  active: number;
  critical: number;
}) {
  const now = useClock();
  const open = pending + active;

  const status =
    critical > 0
      ? { dot: "bg-red-500", label: `${critical} critical incident${critical === 1 ? "" : "s"} open` }
      : open > 0
        ? { dot: "bg-amber-500", label: `${open} open incident${open === 1 ? "" : "s"}` }
        : { dot: "bg-emerald-500", label: "All clear" };

  const detail =
    open === 0
      ? "No open incident reports"
      : `${pending} awaiting assignment · ${active} in progress`;

  return (
    <div className="flex w-full items-stretch divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white sm:w-auto">
      <div className="px-4 py-3">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Local time
        </p>
        <p className="mt-1 text-lg font-semibold leading-none tabular-nums tracking-tight text-stone-900">
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="mt-1.5 text-xs text-stone-500">
          {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>

      <div className="min-w-0 flex-1 px-4 py-3 sm:min-w-56">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Campus status
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold leading-none text-stone-900">
          <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-stone-500">
          <span className="truncate">{detail}</span>
          {open > 0 && (
            <Link
              to="/incidents"
              className="inline-flex shrink-0 items-center gap-1 font-medium text-stone-900 hover:underline"
            >
              Review
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="group rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
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