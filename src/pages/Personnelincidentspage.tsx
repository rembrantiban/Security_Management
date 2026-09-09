import { useEffect, useMemo, useState } from "react";
import { Clock3, Loader2, CheckCircle2, Siren, ShieldAlert } from "lucide-react";
import PersonnelIncidentHeader from "@/components/Incident/PersonnelIncidentHeader";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";
import PersonnelIncidentTable from "@/components/Incident/PersonnelIncidentTable";
import ResolveIncidentDialog from "@/components/PersonnelDashboard/ResolveIncidentDialog";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import type { Incident } from "@/store/useIncidentReportStore";

export default function PersonnelIncidentsPage() {
    const { myIncidents, getMyIncidentReports } = useIncidentReport();

    const [reportOpen, setReportOpen] = useState(false);
    const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
    const [resolveOpen, setResolveOpen] = useState(false);

    useEffect(() => {
        getMyIncidentReports();
        //eslint-disable-next-line
    }, []);

    const summary = useMemo(() => {
        const total = myIncidents.length;
        const pending = myIncidents.filter((i) => i.status === "Pending").length;
        const inProgress = myIncidents.filter((i) => i.status === "In Progress").length;
        const resolved = myIncidents.filter(
            (i) => i.status === "Resolved" || i.status === "Closed"
        ).length;
        const critical = myIncidents.filter(
            (i) =>
                (i.severity === "Critical" || i.severity === "High") &&
                i.status !== "Resolved" &&
                i.status !== "Closed"
        ).length;

        return { total, pending, inProgress, resolved, critical };
    }, [myIncidents]);

    return (
        <div className="min-h-full">
            <div className="space-y-2">
                <PersonnelIncidentHeader onCreateIncident={() => setReportOpen(true)} />

                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <SummaryCard
                        icon={Clock3}
                        label="Pending"
                        value={summary.pending}
                        tone="amber"
                    />
                    <SummaryCard
                        icon={Loader2}
                        label="In Progress"
                        value={summary.inProgress}
                        tone="blue"
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Resolved"
                        value={summary.resolved}
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={Siren}
                        label="Open critical / high"
                        value={summary.critical}
                        tone="red"
                    />
                </div>

                <PersonnelIncidentTable
                    incidents={myIncidents}
                    onUpdateDetails={(incident) =>
                        console.log("Update details:", incident.incident_id)
                    }
                    onUploadEvidence={(incident) =>
                        console.log("Upload evidence:", incident.incident_id)
                    }
                    onMarkResolved={(incident) => {
                        setResolveTarget(incident);
                        setResolveOpen(true);
                    }}
                />

                <ReportIncidentModal open={reportOpen} onOpenChange={setReportOpen} />

                <ResolveIncidentDialog
                    open={resolveOpen}
                    onOpenChange={setResolveOpen}
                    incident={resolveTarget}
                    onResolved={getMyIncidentReports}
                />
            </div>
        </div>
    );
}

const summaryTones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-red-50 text-red-600 ring-red-100",
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
        <div className="flex items-center gap-3 rounded-2xl bg-white/50 px-4 py-3 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:ring-slate-300">
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
