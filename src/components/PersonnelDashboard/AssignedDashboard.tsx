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

const statusStyles: Record<IncidentStatus, string> = {
    Pending: "border-slate-200 bg-slate-50 text-slate-600",
    "In Progress": "border-amber-200 bg-amber-50 text-amber-700",
    Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Closed: "border-slate-200 bg-slate-50 text-slate-600",
};

const severityStyles: Record<Incident["severity"], string> = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-slate-100 text-slate-600",
};

const alertStyles: Record<SecurityAlert["level"], { card: string; icon: string }> = {
    Critical: { card: "border-red-200 bg-red-50 text-red-700", icon: "text-red-600" },
    Warning: { card: "border-amber-200 bg-amber-50 text-amber-700", icon: "text-amber-600" },
    Info: { card: "border-blue-200 bg-blue-50 text-blue-700", icon: "text-blue-600" },
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
        if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;

        return created.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <section className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard icon={Radio} label="Assigned incidents" value={personnelStats?.assigned_incidents ?? "0"} tone="orange" />
                <SummaryCard icon={Clock3} label="Active response" value={personnelStats?.active_response ?? "0"} tone="amber" />
                <SummaryCard icon={ShieldAlert} label="Security alerts" value={securityAlerts.length} tone="red" />
                <SummaryCard icon={CheckCircle2} label="Resolved today" value={personnelStats?.resolved_today ?? "0"} tone="emerald" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
                {/* Assigned incidents */}
                <div className="rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                Assigned to you
                            </p>
                            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                                Incident queue
                            </h2>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {getMyAssignedIncidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                                    <ShieldCheck className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    No assigned incidents
                                </h3>
                                <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                                    You don't have any active incidents assigned right now.
                                    New assignments will appear here automatically.
                                </p>
                            </div>
                        ) : (
                            getMyAssignedIncidents.map((incident) => (
                                <article
                                    key={incident.incident_id}
                                    className="p-5 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 space-y-2.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-medium text-slate-400">
                                                    {incident.incident_number}
                                                </span>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityStyles[incident.severity]}`}>
                                                    {incident.severity}
                                                </span>
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[incident.status]}`}>
                                                    {incident.status}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {incident.title}
                                                </h3>
                                                <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4" />
                                                        {incident.location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock3 className="h-4 w-4" />
                                                        {formatRelativeTime(incident.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedIncident(incident);
                                                setOpenResolveDialog(true);
                                            }}
                                            className="shrink-0 gap-1.5 rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Resolve
                                        </Button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    <ResolveIncidentDialog
                        open={openResolveDialog}
                        onOpenChange={setOpenResolveDialog}
                        incident={selectedIncident}
                    />
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    <div className="rounded border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                Live feed
                            </p>
                            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                                Security alerts
                            </h2>
                        </div>

                        <div className="space-y-2.5 p-5">
                            {securityAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`rounded-lg border p-3.5 ${alertStyles[alert.level].card}`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {alert.level === "Critical" ? (
                                            <Siren className={`mt-0.5 h-4 w-4 shrink-0 ${alertStyles[alert.level].icon}`} />
                                        ) : (
                                            <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${alertStyles[alert.level].icon}`} />
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-semibold">{alert.title}</h3>
                                                <span className="text-xs font-medium opacity-70">
                                                    {alert.id}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs opacity-80">
                                                {alert.area} · {alert.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded border border-orange-900 bg-orange-900 p-5 text-white shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                            Shift overview
                        </p>
                        <h2 className="mt-1 text-base font-semibold">
                            Stay alert during your shift
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-orange-100">
                            Monitor assigned incidents, respond to visitor requests, and keep
                            track of new security alerts. Ensure all assigned tasks are
                            completed before the end of your shift.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

const summaryTones = {
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
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
        <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900">
                        {value}
                    </p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${summaryTones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}