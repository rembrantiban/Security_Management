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

type IncidentStatus =
    | "Pending"
    | "In Progress"
    | "Resolved"
    | "Closed";


type AssignedIncident = {
    incident_id: string;
    title: string;
    location: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    created_at: string;
    status: IncidentStatus;
};

type SecurityAlert = {
    id: string;
    title: string;
    area: string;
    level: "Critical" | "Warning" | "Info";
    time: string;
};



const securityAlerts: SecurityAlert[] = [
    {
        id: "ALT-118",
        title: "Camera offline",
        area: "North Hallway",
        level: "Critical",
        time: "2 min ago",
    },
    {
        id: "ALT-119",
        title: "Door left open",
        area: "Records Room",
        level: "Warning",
        time: "12 min ago",
    },
    {
        id: "ALT-120",
        title: "Shift handover reminder",
        area: "Security Office",
        level: "Info",
        time: "25 min ago",
    },
];

const statusStyles: Record<IncidentStatus, string> = {
    Pending: "border-slate-200 bg-slate-50 text-slate-700",
    "In Progress": "border-amber-200 bg-amber-50 text-amber-700",
    Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Closed: "border-slate-200 bg-slate-50 text-slate-700",
};

const severityStyles: Record<AssignedIncident["severity"], string> = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-slate-100 text-slate-600",
};

const alertStyles: Record<SecurityAlert["level"], string> = {
    Critical: "border-red-200 bg-red-50 text-red-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Info: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function AssignedDashboard() {
    const { getMyAssignedIncidents, personnelStats } = useIncidentReport();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [openResolveDialog, setOpenResolveDialog] = useState(false);

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const created = new Date(date);

        const diff = Math.floor(
            (now.getTime() - created.getTime()) / 1000
        );

        if (diff < 60) return "Just now";

        if (diff < 3600)
            return `${Math.floor(diff / 60)} min ago`;

        if (diff < 86400)
            return `${Math.floor(diff / 3600)} hr ago`;

        if (diff < 604800)
            return `${Math.floor(diff / 86400)} day(s) ago`;

        return created.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };



    return (
        <section className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard icon={Radio} label="Assigned Incidents" value={personnelStats?.assigned_incidents ?? "0"} />
                <SummaryCard icon={Clock3} label="Active Response" value={personnelStats?.active_response ?? "0"} />
                <SummaryCard icon={ShieldAlert} label="Security Alerts" value={securityAlerts.length} />
                <SummaryCard icon={CheckCircle2} label="Resolved Today" value={personnelStats?.resolved_today ?? "0"} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
                <div className="rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                View Assigned Incidents
                            </p>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Assigned Incident Queue
                            </h2>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">


                        {getMyAssignedIncidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                                    <ShieldCheck className="h-8 w-8 text-amber-400" />
                                </div>

                                <h3 className="text-lg font-semibold text-slate-900">
                                    No Assigned Incidents
                                </h3>

                                <p className="mt-2 max-w-sm text-sm text-slate-500">
                                    You don't have any active incidents assigned to you at the moment.
                                    New assignments will appear here automatically.
                                </p>
                            </div>
                        ) : (getMyAssignedIncidents.map((incident) => (
                            <article key={incident.incident_id} className="p-5  ">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ">
                                    <div className="min-w-0 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-500">
                                                {incident.incident_number}
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityStyles[incident.severity]}`}
                                            >
                                                {incident.severity}
                                            </span>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[incident.status]}`}
                                            >
                                                {incident.status}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {incident.title}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
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

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        <Button
                                            size="sm"
                                            type="button"
                                            onClick={() => {
                                                setSelectedIncident(incident);
                                                setOpenResolveDialog(true);
                                            }}
                                            className=" bg-amber-700 rounded border px-3 py-2 text-xs font-semibold transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 "

                                        >
                                            <CheckCircle2 />
                                            Resolved
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        )))}
                    </div>
                    <ResolveIncidentDialog
                        open={openResolveDialog}
                        onOpenChange={setOpenResolveDialog}
                        incident={selectedIncident}
                    />
                </div>

                <aside className="space-y-5">
                    <div className="rounded border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                View Security Alerts
                            </p>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Live Security Alerts
                            </h2>
                        </div>

                        <div className="space-y-3 p-5">
                            {securityAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`rounded border p-4 ${alertStyles[alert.level]}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {alert.level === "Critical" ? (
                                            <Siren className="mt-0.5 h-5 w-5" />
                                        ) : (
                                            <AlertTriangle className="mt-0.5 h-5 w-5" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">{alert.title}</h3>
                                                <span className="text-xs font-semibold opacity-80">
                                                    {alert.id}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm opacity-80">
                                                {alert.area} - {alert.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded border border-slate-200 bg-amber-950 p-5 text-white shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                            Shift Overview
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">Stay Alert During Your Shift</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                            Monitor assigned incidents, respond to visitor requests, and keep track
                            of new security alerts. Ensure all assigned tasks are completed before
                            the end of your shift.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Radio;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded bg-orange-50 text-orange-600">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
