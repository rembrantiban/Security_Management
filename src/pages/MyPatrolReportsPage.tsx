import { useEffect, useMemo, useState } from "react";
import {
    ClipboardList,
    Search,
    X,
    Eye,
    MapPin,
    CalendarRange,
    FileText,
    FileSpreadsheet,
    Printer,
    Download,
    Loader2,
    ShieldAlert,
    Inbox,
    Footprints,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { usePatrolStore } from "@/store/usePatrolStore";
import { useIncidentStore } from "@/store/useIncidentReportStore";
import type { Incident } from "@/store/useIncidentReportStore";
import {
    buildPatrolReport,
    downloadPatrolReportExcel,
    type PatrolReportModel,
    type ReportMeta,
} from "@/lib/reports/patrolReport";
import PatrolReportDocument, {
    PatrolReportPrintMount,
} from "@/components/Report/PatrolReportDocument";

type Tab = "assigned" | "patrol";
type ExportFormat = "PDF" | "Excel";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const severityChip: Record<string, string> = {
    Critical: "bg-red-50 text-red-700 ring-red-100",
    High: "bg-orange-50 text-orange-700 ring-orange-100",
    Medium: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    Low: "bg-slate-50 text-slate-500 ring-slate-200",
};

const statusChip: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-100",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-100",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Closed: "bg-slate-50 text-slate-500 ring-slate-200",
};

const formats: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "Excel", label: "Excel", icon: FileSpreadsheet },
];

function fmtDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function MyPatrolReportsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const { completedPatrols, getMyCompletedPatrols } = usePatrolStore();
    const { myIncidents, getMyIncidentReports } = useIncidentStore();

    const [tab, setTab] = useState<Tab>("assigned");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Incident | null>(null);

    const [format, setFormat] = useState<ExportFormat>("PDF");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        getMyCompletedPatrols();
        getMyIncidentReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const userName = user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : undefined;

    // The report always covers every completed patrol — no date-range filter.
    const meta = (): ReportMeta => ({
        title: "Patrol Activity Report",
        dateFrom: "",
        dateTo: "",
        generatedBy: userName,
    });

    const patrolModel: PatrolReportModel = useMemo(
        () => buildPatrolReport(completedPatrols, meta()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [completedPatrols, userName]
    );

    // 7.9 — reports the personnel created that have been resolved or closed.
    const resolvedReports = useMemo(
        () =>
            myIncidents.filter(
                (i) => i.status === "Resolved" || i.status === "Closed"
            ),
        [myIncidents]
    );

    const filteredIncidents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return resolvedReports;
        return resolvedReports.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                i.incident_number.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
        );
    }, [resolvedReports, search]);

    const runPatrolExport = (fmt: ExportFormat) => {
        if (fmt === "Excel") {
            downloadPatrolReportExcel(patrolModel);
            showToast(
                "success",
                "Excel exported",
                `${patrolModel.summary.total} patrol record(s) downloaded.`
            );
            return;
        }

        window.print();
    };

    const handleGenerate = () => {
        setGenerating(true);
        runPatrolExport(format);
        setGenerating(false);
    };

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                            <ClipboardList className="h-3 w-3" />
                            Personnel Reporting
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            My Reports
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Review your resolved and closed incident reports and generate a
                            formal record of your completed patrols.
                        </p>
                    </div>

                    {tab === "patrol" && (
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50 disabled:opacity-60"
                        >
                            {generating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            {generating ? "Generating…" : "Generate report"}
                        </Button>
                    )}

                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="inline-flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                    <button
                        type="button"
                        onClick={() => setTab("assigned")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                            tab === "assigned"
                                ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Assigned Reports
                        <span
                            className={`tabular-nums ${
                                tab === "assigned"
                                    ? "text-amber-700/70"
                                    : "text-slate-400"
                            }`}
                        >
                            {resolvedReports.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab("patrol")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                            tab === "patrol"
                                ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <Footprints className="h-3.5 w-3.5" />
                        Patrol Activity Report
                    </button>
                </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* 7.9 — Assigned Reports                                           */}
            {/* ---------------------------------------------------------------- */}
            {tab === "assigned" && (
                <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

                    <div className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search title, number, or location"
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

                        <span className="text-[11px] text-slate-400">
                            {filteredIncidents.length} resolved / closed report
                            {filteredIncidents.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead className={`${headCell} px-5`}>
                                        Incident
                                    </TableHead>
                                    <TableHead className={`${headCell} hidden md:table-cell`}>
                                        Category
                                    </TableHead>
                                    <TableHead className={headCell}>Severity</TableHead>
                                    <TableHead className={headCell}>Status</TableHead>
                                    <TableHead className={`${headCell} hidden lg:table-cell`}>
                                        Location
                                    </TableHead>
                                    <TableHead className={`${headCell} hidden sm:table-cell`}>
                                        Reported
                                    </TableHead>
                                    <TableHead className={`${headCell} px-5 text-right`}>
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredIncidents.map((incident) => (
                                    <TableRow
                                        key={incident.incident_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                                                    <ShieldAlert className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {incident.title}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-slate-400">
                                                        {incident.incident_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="hidden py-3 text-[12.5px] text-slate-600 md:table-cell">
                                            {incident.category}
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span
                                                className={`${chip} ${
                                                    severityChip[incident.severity] ??
                                                    "bg-slate-50 text-slate-500 ring-slate-200"
                                                }`}
                                            >
                                                {incident.severity}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span
                                                className={`${chip} ${
                                                    statusChip[incident.status] ??
                                                    "bg-slate-50 text-slate-500 ring-slate-200"
                                                }`}
                                            >
                                                {incident.status}
                                            </span>
                                        </TableCell>

                                        <TableCell className="hidden py-3 text-[12.5px] text-slate-600 lg:table-cell">
                                            {incident.location}
                                        </TableCell>

                                        <TableCell className="hidden whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-400 sm:table-cell">
                                            {fmtDate(incident.created_at)}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-right">
                                            <Button
                                                size="sm"
                                                className="h-7 gap-1.5 rounded-lg bg-white px-3 text-[11px] font-medium text-slate-600 shadow-none ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                                onClick={() => setSelected(incident)}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredIncidents.length === 0 && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={7} className="py-16 text-center">
                                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                                <Inbox className="h-5 w-5 text-amber-800" />
                                            </div>
                                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                                {resolvedReports.length === 0
                                                    ? "No resolved or closed reports yet"
                                                    : "No matching reports"}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {resolvedReports.length === 0
                                                    ? "Reports you submitted appear here once they are resolved or closed."
                                                    : "Adjust your search to see more."}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 7.10 — Patrol Activity Report                                    */}
            {/* ---------------------------------------------------------------- */}
            {tab === "patrol" && (
                <>
                    <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                            Parameters
                        </p>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                                Covers all your completed patrols
                            </div>

                            <div>
                                <p className="text-[11px] font-medium text-slate-600">
                                    Export format
                                </p>
                                <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                                    {formats.map((f) => {
                                        const FIcon = f.icon;
                                        const active = format === f.value;
                                        return (
                                            <button
                                                key={f.value}
                                                type="button"
                                                onClick={() => setFormat(f.value)}
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                                                    active
                                                        ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                                        : "text-slate-500 hover:text-slate-900"
                                                }`}
                                            >
                                                <FIcon className="h-3.5 w-3.5" />
                                                {f.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="h-9 gap-2 rounded-xl bg-amber-800 px-4 text-[12.5px] font-medium text-white hover:bg-amber-900 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    {generating ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    {generating ? "Generating…" : `Generate ${format}`}
                                </Button>

                                <Button
                                    onClick={() =>
                                        runPatrolExport(
                                            format === "Excel" ? "Excel" : "PDF"
                                        )
                                    }
                                    variant="ghost"
                                    className="h-9 gap-2 rounded-xl text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    {format === "Excel" ? (
                                        <>
                                            <Download className="h-3.5 w-3.5" />
                                            Excel
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="h-3.5 w-3.5" />
                                            Print
                                        </>
                                    )}
                                </Button>

                                <span className="ml-auto text-[11px] text-slate-400">
                                    {patrolModel.summary.total} record
                                    {patrolModel.summary.total === 1 ? "" : "s"} in range
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                                Document preview
                            </p>
                            <span className="text-[11px] text-slate-400">
                                {patrolModel.reference}
                            </span>
                        </div>

                        <PatrolReportDocument model={patrolModel} maxHeight="70vh" />
                    </div>

                    <PatrolReportPrintMount model={patrolModel} />
                </>
            )}

            {/* Assigned report detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Assigned report
                            </p>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                onClick={() => setSelected(null)}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4">
                            <p className="text-[15px] font-semibold leading-tight tracking-tight text-slate-900">
                                {selected.title}
                            </p>
                            <p className="mt-1 font-mono text-[11px] tracking-tight text-slate-400">
                                {selected.incident_number}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                <span
                                    className={`${chip} ${
                                        severityChip[selected.severity] ??
                                        "bg-slate-50 text-slate-500 ring-slate-200"
                                    }`}
                                >
                                    {selected.severity}
                                </span>
                                <span
                                    className={`${chip} ${
                                        statusChip[selected.status] ??
                                        "bg-slate-50 text-slate-500 ring-slate-200"
                                    }`}
                                >
                                    {selected.status}
                                </span>
                                <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                                    {selected.category}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-[12.5px] text-slate-600">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                {selected.location}
                            </div>

                            <div className="mt-4">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                    Description
                                </p>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                                    {selected.description}
                                </p>
                            </div>

                            <p className="mt-4 text-[11px] text-slate-400">
                                Reported {fmtDate(selected.created_at)} by{" "}
                                {selected.reported_by_name}
                            </p>
                        </div>

                        <div className="shrink-0 border-t border-slate-100 p-4">
                            <Button
                                variant="ghost"
                                className="w-full gap-1.5 rounded-xl text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => window.print()}
                            >
                                <Printer className="h-3.5 w-3.5" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
