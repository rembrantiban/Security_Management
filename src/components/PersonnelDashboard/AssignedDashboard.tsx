import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    MapPin,
    Radio,
    ShieldAlert,
    ShieldCheck,
    Siren,
} from "lucide-react";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { Button } from "@/components/ui/button";
import ResolveIncidentDialog from "./ResolveIncidentDialog";
import type { Incident } from "@/store/useIncidentReportStore";

type IncidentStatus = "Pending" | "In Progress" | "Resolved" | "Closed";

type SecurityAlert = {
    id: string;
    title: string;
    area: string;
    level: "Critical" | "Warning" | "Info";
    time: string;
};

const securityAlerts: SecurityAlert[] = [
    { id: "ALT-118", title: "Camera offline", area: "North Hallway", level: "Critical", time: "2 min ago" },
    { id: "ALT-119", title: "Door left open", area: "Records Room", level: "Warning", time: "12 min ago" },
    { id: "ALT-120", title: "Shift handover reminder", area: "Security Office", level: "Info", time: "25 min ago" },
];

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const statusStyles: Record<IncidentStatus, string> = {
    Pending: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-100",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Closed: "bg-slate-50 text-slate-500 ring-slate-200",
};

const severityStyles: Record<Incident["severity"], { chip: string; tile: string; dot: string }> = {
    Critical: {
        chip: "bg-red-50 text-red-700 ring-red-100",
        tile: "bg-red-50 text-red-600 ring-red-100",
        dot: "bg-red-500",
    },
    High: {
        chip: "bg-orange-50 text-orange-700 ring-orange-100",
        tile: "bg-orange-50 text-orange-600 ring-orange-100",
        dot: "bg-orange-500",
    },
    Medium: {
        chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        tile: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
    },
    Low: {
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
        tile: "bg-slate-50 text-slate-400 ring-slate-200",
        dot: "bg-slate-300",
    },
};

const alertStyles: Record<SecurityAlert["level"], { tile: string; dot: string }> = {
    Critical: { tile: "bg-red-50 text-red-600 ring-red-100", dot: "bg-red-500" },
    Warning: { tile: "bg-amber-50 text-amber-700 ring-amber-100", dot: "bg-amber-500" },
    Info: { tile: "bg-blue-50 text-blue-600 ring-blue-100", dot: "bg-blue-500" },
};

export default function AssignedDashboard() {
    const { getMyAssignedIncidents, personnelStats } = useIncidentReport();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [openResolveDialog, setOpenResolveDialog] = useState(false);

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

        return created.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <section className="space-y-2">

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={Radio}
                    label="Assigned incidents"
                    value={personnelStats?.assigned_incidents ?? "0"}
                    tone="amber"
                />
                <SummaryCard
                    icon={Clock3}
                    label="Active response"
                    value={personnelStats?.active_response ?? "0"}
                    tone="blue"
                />
                <SummaryCard
                    icon={ShieldAlert}
                    label="Security alerts"
                    value={securityAlerts.length}
                    tone="red"
                />
                <SummaryCard
                    icon={CheckCircle2}
                    label="Resolved today"
                    value={personnelStats?.resolved_today ?? "0"}
                    tone="emerald"
                />
            </div>

            <div className="grid gap-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">

                {/* Assigned incidents */}
                <div className="flex flex-col overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <ShieldAlert className="h-4 w-4 text-amber-800" />
                        </div>

                        <div>
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Incident queue
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-700">
                                Incidents currently assigned to you
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-slate-100">
                        {getMyAssignedIncidents.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                </div>

                                <p className="mt-3 text-[13px] font-medium text-slate-700">
                                    Queue is clear
                                </p>
                                <p className="mx-auto mt-1 max-w-xs text-[11px] text-slate-400">
                                    New assignments will appear here as they come in.
                                </p>
                            </div>
                        ) : (
                            getMyAssignedIncidents.map((incident) => {
                                const sev = severityStyles[incident.severity];

                                return (
                                    <article
                                        key={incident.incident_id}
                                        className="px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                            <div className="flex min-w-0 gap-3">
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.tile}`}
                                                >
                                                    <Siren className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {incident.title}
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                        <span className={`${chip} ${sev.chip}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                                            {incident.severity}
                                                        </span>

                                                        <span className={`${chip} ${statusStyles[incident.status]}`}>
                                                            {incident.status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                                                        <span className="font-mono tracking-tight">
                                                            {incident.incident_number}
                                                        </span>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {incident.location}
                                                        </span>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="tabular-nums">
                                                            {formatRelativeTime(incident.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedIncident(incident);
                                                    setOpenResolveDialog(true);
                                                }}
                                                className="h-7 shrink-0 gap-1.5 self-start rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-amber-900"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Resolve
                                            </Button>

                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>

                    <ResolveIncidentDialog
                        open={openResolveDialog}
                        onOpenChange={setOpenResolveDialog}
                        incident={selectedIncident}
                    />
                </div>

                {/* Sidebar */}
                <aside className="space-y-2">

                    <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                <Radio className="h-4 w-4 text-amber-800" />
                            </div>

                            <div>
                                <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                    Security alerts
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-600">
                                    Live feed from campus systems
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {securityAlerts.map((alert) => {
                                const style = alertStyles[alert.level];

                                return (
                                    <div
                                        key={alert.id}
                                        className="flex items-start gap-3 px-5 py-3 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${style.tile}`}
                                        >
                                            {alert.level === "Critical" ? (
                                                <Siren className="h-3.5 w-3.5" />
                                            ) : (
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-[12.5px] font-medium leading-none text-slate-900">
                                                    {alert.title}
                                                </p>
                                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                                            </div>

                                            <p className="mt-1.5 truncate text-[11px] text-slate-700">
                                                <span className="font-mono tracking-tight">{alert.id}</span>
                                                <span className="text-slate-300"> · </span>
                                                {alert.area}
                                                <span className="text-slate-300"> · </span>
                                                {alert.time}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-amber-800 p-5 shadow-sm">
                        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-600/30 blur-3xl" />

                        <div className="relative">
                            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                                Shift overview
                            </span>

                            <p className="mt-3 text-[13px] font-semibold tracking-tight text-white">
                                Stay alert during your shift
                            </p>

                            <p className="mt-1.5 text-[12px] leading-relaxed text-amber-100/70">
                                Respond to assigned incidents, handle visitor requests, and
                                clear your queue before handover.
                            </p>
                        </div>
                    </div>

                </aside>
            </div>
        </section>
    );
}

const summaryTones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
} as const;

function SummaryCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Radio;
    label: string;
    value: string | number;
    tone: keyof typeof summaryTones;
}) {
    return (
        <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300">
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-700">
                    {label}
                </p>

                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${summaryTones[tone]}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                {value}
            </p>
        </div>
    );
}