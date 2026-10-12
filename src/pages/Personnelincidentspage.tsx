import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    CheckCircle2,
    ClipboardList,
    Clock3,
    Loader2,
    ShieldAlert,
    Siren,
    UserCheck,
} from "lucide-react";
import PersonnelIncidentHeader from "@/components/Incident/PersonnelIncidentHeader";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";
import PersonnelIncidentTable from "@/components/Incident/PersonnelIncidentTable";
import IncidentReportSummary from "@/components/Incident/IncidentReportSummary";
import IncidentStatusGuide from "@/components/Incident/IncidentStatusGuide";
import AssignedIncidentList from "@/components/Incident/AssignedIncidentList";
import ResolveIncidentModal, {
    type ResolvableIncident,
} from "@/components/Incident/ResolveIncidentModal";
import { isIncidentOpen } from "@/components/Incident/incidentUi";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import {
    useIncidentStore,
    type AssignedIncident,
    type Incident,
} from "@/store/useIncidentReportStore";

type Tab = "assigned" | "reported";

const isHighPriority = (severity: Incident["severity"]) =>
    severity === "Critical" || severity === "High";

const fromAssigned = (incident: AssignedIncident): ResolvableIncident => ({
    ...incident,
    reporterName: incident.reported_by,
    assignedByName: incident.assigned_by,
});

const fromReported = (incident: Incident): ResolvableIncident => ({
    ...incident,
    reporterName: incident.reported_by_name,
});

export default function PersonnelIncidentsPage() {
    const { myIncidents, getMyIncidentReports } = useIncidentReport();
    const assignedIncidents = useIncidentStore((s) => s.assignedIncidents);
    const isFetchingAssigned = useIncidentStore((s) => s.isFetchingAssigned);
    const getAssignedIncidents = useIncidentStore((s) => s.getAssignedIncidents);

    const [searchParams, setSearchParams] = useSearchParams();
    const tab: Tab = searchParams.get("tab") === "reported" ? "reported" : "assigned";

    const [reportOpen, setReportOpen] = useState(false);
    const [resolveTarget, setResolveTarget] = useState<ResolvableIncident | null>(null);
    const [resolveOpen, setResolveOpen] = useState(false);

    useEffect(() => {
        getAssignedIncidents();
    }, [getAssignedIncidents]);

    const setTab = (next: Tab) => {
        setSearchParams(
            (params) => {
                if (next === "assigned") params.delete("tab");
                else params.set("tab", next);
                return params;
            },
            { replace: true }
        );
    };

    const openResolve = (incident: ResolvableIncident) => {
        setResolveTarget(incident);
        setResolveOpen(true);
    };

    const assignedSummary = useMemo(() => {
        const open = assignedIncidents.filter((i) => isIncidentOpen(i.status));
        return {
            total: assignedIncidents.length,
            open: open.length,
            urgent: open.filter((i) => isHighPriority(i.severity)).length,
            resolved: assignedIncidents.length - open.length,
        };
    }, [assignedIncidents]);

    const reportedSummary = useMemo(() => {
        const count = (predicate: (i: Incident) => boolean) => myIncidents.filter(predicate).length;
        return {
            total: myIncidents.length,
            pending: count((i) => i.status === "Pending"),
            inProgress: count((i) => i.status === "In Progress"),
            resolved: count((i) => !isIncidentOpen(i.status)),
            urgent: count((i) => isHighPriority(i.severity) && isIncidentOpen(i.status)),
        };
    }, [myIncidents]);

    return (
        <div className="min-h-full">
            <div className="space-y-3">
                <PersonnelIncidentHeader
                    onCreateIncident={() => setReportOpen(true)}
                    description="Respond to incidents assigned to you and track everything you've reported through to resolution."
                />

                {/* Tabs */}
                <div
                    role="tablist"
                    aria-label="Incident views"
                    className="flex gap-1 border-b border-slate-200"
                >
                    <TabButton
                        active={tab === "assigned"}
                        onClick={() => setTab("assigned")}
                        icon={UserCheck}
                        label="Assigned to me"
                        count={assignedSummary.open}
                        highlight={assignedSummary.urgent > 0}
                    />
                    <TabButton
                        active={tab === "reported"}
                        onClick={() => setTab("reported")}
                        icon={ClipboardList}
                        label="Reported by me"
                        count={reportedSummary.total}
                    />
                </div>

                {tab === "assigned" ? (
                    <div role="tabpanel" aria-label="Assigned to me" className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                            <SummaryCard icon={Loader2} label="Open assignments" value={assignedSummary.open} tone="blue" />
                            <SummaryCard icon={Siren} label="Open critical / high" value={assignedSummary.urgent} tone="red" />
                            <SummaryCard icon={CheckCircle2} label="Resolved" value={assignedSummary.resolved} tone="emerald" />
                            <SummaryCard icon={UserCheck} label="Total assigned" value={assignedSummary.total} tone="slate" />
                        </div>

                        <AssignedIncidentList
                            incidents={assignedIncidents}
                            isLoading={isFetchingAssigned}
                            onRefresh={getAssignedIncidents}
                            onResolve={(incident) => openResolve(fromAssigned(incident))}
                        />
                    </div>
                ) : (
                    <div role="tabpanel" aria-label="Reported by me" className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                            <SummaryCard icon={Clock3} label="Pending" value={reportedSummary.pending} tone="amber" />
                            <SummaryCard icon={Loader2} label="In Progress" value={reportedSummary.inProgress} tone="blue" />
                            <SummaryCard icon={CheckCircle2} label="Resolved" value={reportedSummary.resolved} tone="emerald" />
                            <SummaryCard icon={Siren} label="Open critical / high" value={reportedSummary.urgent} tone="red" />
                        </div>

                        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="min-w-0 space-y-3">
                                <PersonnelIncidentTable
                                    incidents={myIncidents}
                                    onUpdateDetails={() => undefined}
                                    onUploadEvidence={() => undefined}
                                    onMarkResolved={(incident) => openResolve(fromReported(incident))}
                                />
                                <IncidentStatusGuide />
                            </div>

                            <div className="xl:sticky xl:top-0">
                                <IncidentReportSummary incidents={myIncidents} />
                            </div>
                        </div>
                    </div>
                )}

                <ReportIncidentModal open={reportOpen} onOpenChange={setReportOpen} />

                <ResolveIncidentModal
                    open={resolveOpen}
                    onOpenChange={setResolveOpen}
                    incident={resolveTarget}
                    onResolved={getMyIncidentReports}
                />
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon: Icon,
    label,
    count,
    highlight = false,
}: {
    active: boolean;
    onClick: () => void;
    icon: typeof ShieldAlert;
    label: string;
    count: number;
    highlight?: boolean;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-[12.5px] font-medium transition-colors ${
                active
                    ? "border-amber-700 text-slate-900"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            }`}
        >
            <Icon className={`h-3.5 w-3.5 ${active ? "text-amber-700" : "text-slate-400"}`} />
            {label}
            <span
                className={`min-w-5 rounded-full px-1.5 py-px text-center text-[10.5px] font-semibold tabular-nums ${
                    highlight
                        ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                        : active
                          ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                          : "bg-slate-100 text-slate-500"
                }`}
            >
                {count}
            </span>
        </button>
    );
}

const summaryTones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
} as const;

function SummaryCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof ShieldAlert;
    label: string;
    value: number;
    tone: keyof typeof summaryTones;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors duration-200 hover:border-gray-300">
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${summaryTones[tone]}`}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 leading-tight">
                <p className="text-[18px] font-semibold tabular-nums tracking-tight text-slate-900">
                    {value}
                </p>
                <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
}
