import { useMemo, useState } from "react";
import PersonnelIncidentHeader from "@/components/Incident/PersonnelIncidentHeader";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";
import StaffIncidentTracker from "@/components/Incident/StaffIncidentTracker";
import { useStaffIncidents } from "@/hooks/useStaffIncidents";
import { Input } from "@/components/ui/input";
import { Clock3, Loader2, CheckCircle2, ShieldAlert, Search, X } from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "In Progress", "Resolved", "Closed"];
const SEVERITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"];

export default function StaffIncidentsPage() {
    const { mySubmittedIncidents, isFetchingSubmitted } = useStaffIncidents();
    const [reportOpen, setReportOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [severity, setSeverity] = useState("All");

    const hasFilters =
        search.trim() !== "" || status !== "All" || severity !== "All";

    const pending = mySubmittedIncidents.filter((i) => i.status === "Pending").length;
    const inProgress = mySubmittedIncidents.filter((i) => i.status === "In Progress").length;
    const resolved = mySubmittedIncidents.filter(
        (i) => i.status === "Resolved" || i.status === "Closed"
    ).length;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return mySubmittedIncidents.filter((i) => {
            const matchesSearch =
                q === "" ||
                i.title.toLowerCase().includes(q) ||
                i.incident_number.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q);

            const matchesStatus = status === "All" || i.status === status;
            const matchesSeverity = severity === "All" || i.severity === severity;

            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [mySubmittedIncidents, search, status, severity]);

    const clearFilters = () => {
        setSearch("");
        setStatus("All");
        setSeverity("All");
    };

    return (
        <div className="space-y-2">
            <PersonnelIncidentHeader onCreateIncident={() => setReportOpen(true)} />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
                <SummaryCard icon={Clock3} label="Pending" value={pending} tone="amber" />
                <SummaryCard icon={Loader2} label="In Progress" value={inProgress} tone="blue" />
                <SummaryCard icon={CheckCircle2} label="Resolved" value={resolved} tone="emerald" />
            </div>

            {/* Filter toolbar */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, number, location, or category"
                            className="h-9 rounded-xl border-0 bg-slate-50 pl-9 pr-8 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s === "All" ? "All statuses" : s}
                                </option>
                            ))}
                        </select>

                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="h-9 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                        >
                            {SEVERITY_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s === "All" ? "All severities" : s}
                                </option>
                            ))}
                        </select>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="h-9 shrink-0 rounded-xl px-2.5 text-[12px] font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <StaffIncidentTracker
                incidents={filtered}
                isLoading={isFetchingSubmitted}
                hasFilters={hasFilters}
            />

            <ReportIncidentModal open={reportOpen} onOpenChange={setReportOpen} />
        </div>
    );
}

const summaryTones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
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
                <p className="truncate text-[11px] font-medium text-slate-500">
                    {label}
                </p>
            </div>
        </div>
    );
}
