import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    TriangleAlert,
    CalendarClock,
    Radar,
    ClipboardCheck,
    FileWarning,
    MapPin,
    Clock,
    ArrowRight,
    ScrollText,
    Search,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMonitoring } from "@/hooks/useMonitoring";
import { usePatrol } from "@/hooks/usePatrol";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import ViewAssignedPatrol from "@/components/PersonnelDashboard/ViewAssignedPatrol";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";

const periodFilters = ["All", "Today", "This week", "This month"] as const;
type PeriodFilter = (typeof periodFilters)[number];

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDuration(start: string, end: string) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (Number.isNaN(ms) || ms < 0) return "—";

    const totalMinutes = Math.round(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

function isWithinPeriod(value: string, period: PeriodFilter) {
    if (period === "All") return true;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    if (period === "Today") {
        return date >= startOfToday;
    }

    if (period === "This week") {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return date >= startOfWeek;
    }

    // This month
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    );
}

export default function PersonnelPatrolsPage() {
    const navigate = useNavigate();
    const { mySchedules, getMyMonitoringSchedules } = useMonitoring();
    const { completedPatrols, getMyCompletedPatrols } = usePatrol();
    const { myIncidents, getMyIncidentReports } = useIncidentReport();
    const [reportOpen, setReportOpen] = useState(false);
    const [logSearch, setLogSearch] = useState("");
    const [period, setPeriod] = useState<PeriodFilter>("All");

    useEffect(() => {
        getMyMonitoringSchedules();
        getMyCompletedPatrols();
        getMyIncidentReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const assignedCount = mySchedules.length;
    const ongoingCount = mySchedules.filter((s) => s.status === "Ongoing").length;
    const completedCount = completedPatrols.length;
    const suspiciousReportsCount = myIncidents.filter(
        (i) => i.category === "Suspicious Activity"
    ).length;

    const stats = [
        {
            title: "Assigned Patrols",
            value: assignedCount,
            description: "Currently on your list",
            icon: CalendarClock,
            accent: "bg-blue-50 text-blue-600 ring-blue-100",
        },
        {
            title: "Ongoing",
            value: ongoingCount,
            description: "Active right now",
            icon: Radar,
            accent: "bg-amber-50 text-amber-700 ring-amber-100",
        },
        {
            title: "Completed",
            value: completedCount,
            description: "Patrols recorded",
            icon: ClipboardCheck,
            accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        },
        {
            title: "Suspicious Reports",
            value: suspiciousReportsCount,
            description: "Filed by you",
            icon: FileWarning,
            accent: "bg-red-50 text-red-600 ring-red-100",
        },
    ];

    const filteredLogs = useMemo(() => {
        const query = logSearch.trim().toLowerCase();

        return completedPatrols.filter((log) => {
            const matchesSearch =
                query === "" ||
                (log.area_patrolled ?? "").toLowerCase().includes(query);

            const matchesPeriod = isWithinPeriod(log.schedule_date, period);

            return matchesSearch && matchesPeriod;
        });
    }, [completedPatrols, logSearch, period]);

    const hasLogFilters = logSearch.trim() !== "" || period !== "All";

    const recentLogs = filteredLogs.slice(0, 6);

    return (
        <div className="space-y-2 p-4">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                {/* Ambient wash */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                            <ShieldCheck className="h-5 w-5 text-amber-100" />
                        </div>

                        <div className="min-w-0">
                            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                                Patrol Operations
                            </span>

                            <h1 className="mt-2 text-[18px] font-semibold tracking-tight text-white">
                                My Patrols
                            </h1>

                            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                                Track your assigned areas, record patrol logs as you finish
                                each duty, and flag anything suspicious.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setReportOpen(true)}
                        className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-red-700 shadow-sm hover:bg-red-50"
                    >
                        <TriangleAlert className="h-3.5 w-3.5" />
                        Report suspicious activity
                    </Button>

                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-2xl bg-white/50 py-2 px-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-700">
                                    {item.title}
                                </p>

                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${item.accent}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>

                            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                                {item.value}
                            </p>

                            <p className="mt-2 truncate text-[11px] text-slate-700">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Assigned Patrol Schedule */}
            <ViewAssignedPatrol />

            {/* Recent Patrol Logs */}
            <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <ScrollText className="h-4 w-4 text-amber-800" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Recent Patrol Logs
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-700">
                                {hasLogFilters
                                    ? `${filteredLogs.length} of ${completedPatrols.length} logs`
                                    : "Your most recently recorded patrols"}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 gap-1 self-start rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900 lg:self-auto"
                        onClick={() => navigate("/personnel/reports")}
                    >
                        View all
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            placeholder="Search area patrolled"
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            className="h-9 rounded-xl border-0 bg-slate-50 pl-9 pr-8 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300"
                        />

                        {logSearch && (
                            <button
                                type="button"
                                onClick={() => setLogSearch("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Segmented period filter */}
                    <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                        {periodFilters.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPeriod(p)}
                                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${period === p
                                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="divide-y divide-slate-100">
                    {recentLogs.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                <ScrollText className="h-5 w-5 text-slate-400" />
                            </div>

                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                {hasLogFilters ? "No matching logs" : "No patrol logs yet"}
                            </p>

                            <p className="mx-auto mt-1 max-w-xs text-[11px] text-slate-400">
                                {hasLogFilters
                                    ? "Adjust your search or time range to see more."
                                    : "Completed patrols you record will show up here."}
                            </p>
                        </div>
                    ) : (
                        recentLogs.map((log) => (
                            <div
                                key={log.patrol_log_id}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors duration-200 hover:bg-slate-50"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                                        <MapPin className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                            {log.area_patrolled}
                                        </p>
                                        <p className="mt-1 text-[11px] tabular-nums text-slate-800">
                                            {formatDate(log.schedule_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2.5">
                                    {log.patrol_start && (
                                        <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-slate-800">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(log.patrol_start)}
                                        </span>
                                    )}

                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                                        {log.patrol_start && log.patrol_end
                                            ? formatDuration(log.patrol_start, log.patrol_end)
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ReportIncidentModal open={reportOpen} onOpenChange={setReportOpen} />

        </div>
    );
}