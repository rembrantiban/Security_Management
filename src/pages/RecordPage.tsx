import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Archive,
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Loader2,
    Lock,
    MapPin,
    RefreshCw,
    Search,
    SearchX,
    ShieldAlert,
    ShieldCheck,
    Siren,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useToast } from "@/hooks/useToast";
import type { Incident } from "@/store/useIncidentReportStore";
import {
    exportSecurityRecordsExcel,
    filterIncidentRecords,
} from "@/lib/securityRecords";
import ArchivedIncidentsPanel from "@/components/AdminPermission/ArchivedIncidentsPanel";

/* ------------------------------------------------------------------ */
/* Shared visual tokens                                               */
/* ------------------------------------------------------------------ */

const CARD = "rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200";
const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";
const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

type Severity = Incident["severity"];

const severityConfig: Record<
    Severity,
    { icon: typeof Siren; tile: string; chip: string; dot: string }
> = {
    Critical: {
        icon: Siren,
        tile: "bg-red-50 text-red-600 ring-red-100",
        chip: "bg-red-50 text-red-700 ring-red-100",
        dot: "bg-red-500",
    },
    High: {
        icon: ShieldAlert,
        tile: "bg-orange-50 text-orange-600 ring-orange-100",
        chip: "bg-orange-50 text-orange-700 ring-orange-100",
        dot: "bg-orange-500",
    },
    Medium: {
        icon: AlertTriangle,
        tile: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
    },
    Low: {
        icon: AlertTriangle,
        tile: "bg-slate-50 text-slate-400 ring-slate-200",
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
        dot: "bg-slate-300",
    },
};

const statusConfig: Record<string, { dot: string; className: string }> = {
    Pending: { dot: "bg-red-500", className: "bg-red-50 text-red-700 ring-red-100" },
    "In Progress": {
        dot: "bg-blue-500",
        className: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    Resolved: {
        dot: "bg-emerald-500",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    Closed: {
        dot: "bg-slate-400",
        className: "bg-slate-50 text-slate-500 ring-slate-200",
    },
};

const SEVERITY_OPTIONS = ["all", "Critical", "High", "Medium", "Low"];
const STATUS_OPTIONS = ["all", "Pending", "In Progress", "Resolved", "Closed"];
const ROWS_PER_PAGE = 8;

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function RecordPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "Administrator";

    if (!isAdmin) {
        return (
            <div className="space-y-2">
                <RecordsHeader />
                <div className={`${CARD} py-16 text-center`}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                        Administrator access only
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                        The Security Records module is restricted to administrator accounts.
                    </p>
                </div>
            </div>
        );
    }

    return <RecordsModule />;
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

function RecordsHeader() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

            <div className="relative flex items-center gap-3.5 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <ShieldCheck className="h-5 w-5 text-amber-100" />
                </div>

                <div className="min-w-0">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                        Security Records Management
                    </span>

                    <h1 className="mt-2 text-[18px] font-semibold tracking-tight text-white">
                        Security Records
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-amber-100/70">
                        View, search, and filter the security incident register. Archive
                        resolved records, restore archived ones, and export the register.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Module                                                             */
/* ------------------------------------------------------------------ */

function RecordsModule() {
    const {
        incidents,
        getAllIncidents,
        isLoading,
        archiveIncident,
        stats,
    } = useIncidentReport();
    const { showToast } = useToast();

    const [view, setView] = useState<"records" | "archived">("records");
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [reportedSort, setReportedSort] = useState<"desc" | "asc">("desc");

    const [archiveTarget, setArchiveTarget] = useState<Incident | null>(null);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const showArchived = view === "archived";

    // 8.1 View · 8.2 Search · 8.3 Filter — sorted by report date (toggle in the head)
    const records = useMemo(() => {
        const rows = filterIncidentRecords(incidents, {
            search,
            severity,
            status,
            includeClosed: true,
        });

        return rows.sort((a, b) => {
            const diff =
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime();
            return reportedSort === "asc" ? diff : -diff;
        });
    }, [incidents, search, severity, status, reportedSort]);

    const hasFilters =
        search.trim() !== "" || severity !== "all" || status !== "all";

    useEffect(() => {
        setPage(1);
    }, [search, severity, status, reportedSort]);

    const totalPages = Math.max(1, Math.ceil(records.length / ROWS_PER_PAGE));
    const start = (page - 1) * ROWS_PER_PAGE;
    const pageRows = records.slice(start, start + ROWS_PER_PAGE);

    const clearFilters = () => {
        setSearch("");
        setSeverity("all");
        setStatus("all");
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await getAllIncidents();
        setRefreshing(false);
    };

    // 8.6 Export Security Records
    const handleExport = () => {
        if (records.length === 0) {
            showToast(
                "info",
                "Nothing to export",
                "No records match the current search and filters."
            );
            return;
        }

        exportSecurityRecordsExcel(records);
        showToast(
            "success",
            "Export ready",
            `${records.length} record${
                records.length === 1 ? "" : "s"
            } exported to Excel.`
        );
    };

    // 8.4 Archive Records
    const confirmArchive = async () => {
        if (!archiveTarget) return;

        setArchiving(true);
        const success = await archiveIncident(archiveTarget.incident_id);
        setArchiving(false);

        if (success) {
            showToast(
                "success",
                "Record archived",
                `${archiveTarget.incident_number} has been moved to the archive.`
            );
            setArchiveOpen(false);
            setArchiveTarget(null);
        } else {
            showToast(
                "error",
                "Archive failed",
                "Unable to archive this record. Please try again."
            );
        }
    };

    return (
        <div className="space-y-2">
            <RecordsHeader />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <StatCard
                    icon={FileText}
                    label="Total Records"
                    value={stats?.total_incidents ?? records.length}
                    tone="bg-slate-50 text-slate-600 ring-slate-200"
                />
                <StatCard
                    icon={Siren}
                    label="Critical"
                    value={
                        records.filter((r) => r.severity === "Critical").length
                    }
                    tone="bg-red-50 text-red-600 ring-red-100"
                />
                <StatCard
                    icon={ShieldCheck}
                    label="Closed"
                    value={records.filter((r) => r.status === "Closed").length}
                    tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
                />
                <StatCard
                    icon={Archive}
                    label="In View"
                    value={records.length}
                    tone="bg-amber-50 text-amber-700 ring-amber-100"
                />
            </div>

            {showArchived ? (
                /* 8.5 Restore Archived Records */
                <ArchivedIncidentsPanel onBack={() => setView("records")} />
            ) : (
                <>
                    {/* Toolbar */}
                    <div className={CARD}>
                        {/* Row 1 — label + record-level actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
                            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                                Records
                                <span className="ml-2 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600 ring-1 ring-slate-200">
                                    {records.length}
                                </span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleExport}
                                    className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Export
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => setView("archived")}
                                    className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Archive className="h-3.5 w-3.5" />
                                    View archived
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${
                                            refreshing ? "animate-spin" : ""
                                        }`}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Row 2 — search + filters */}
                        <div className="flex flex-col gap-2.5 px-4 py-3 lg:flex-row lg:items-center">
                            <div className="relative w-full lg:max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by title, reference, location, or category"
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

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="hidden items-center gap-1.5 text-[11px] font-medium text-slate-400 lg:inline-flex">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    Filter
                                </span>

                                <Select
                                    value={severity}
                                    onValueChange={(v) => v && setSeverity(v)}
                                >
                                    <SelectTrigger className="h-9 w-full rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-40">
                                        <SelectValue placeholder="Severity" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {SEVERITY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className="text-[12.5px]"
                                            >
                                                {option === "all"
                                                    ? "All severity"
                                                    : option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={status}
                                    onValueChange={(v) => v && setStatus(v)}
                                >
                                    <SelectTrigger className="h-9 w-full rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className="text-[12.5px]"
                                            >
                                                {option === "all"
                                                    ? "All status"
                                                    : option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table — 8.1 View Security Records */}
                    <div className={`overflow-hidden ${CARD}`}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                        <TableHead className={`${headCell} px-5`}>
                                            Record
                                        </TableHead>
                                        <TableHead className={headCell}>Category</TableHead>
                                        <TableHead className={headCell}>Location</TableHead>
                                        <TableHead className={headCell}>Severity</TableHead>
                                        <TableHead className={headCell}>Status</TableHead>
                                        <TableHead className={headCell}>Reported By</TableHead>
                                        <TableHead className={headCell}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setReportedSort((d) =>
                                                        d === "asc" ? "desc" : "asc"
                                                    )
                                                }
                                                className="inline-flex items-center gap-1 uppercase tracking-[0.1em] text-slate-400 transition hover:text-slate-700"
                                            >
                                                Reported
                                                {reportedSort === "asc" ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </TableHead>
                                        <TableHead
                                            className={`${headCell} px-5 text-right`}
                                        >
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {isLoading && records.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={8} className="py-16 text-center">
                                                <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                                                <p className="mt-3 text-[12px] text-slate-500">
                                                    Loading records…
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : pageRows.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={8} className="py-16 text-center">
                                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                                    {incidents.length === 0 ? (
                                                        <FileText className="h-5 w-5 text-slate-400" />
                                                    ) : (
                                                        <SearchX className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <p className="mt-3 text-[13px] font-medium text-slate-700">
                                                    {incidents.length === 0
                                                        ? "No security records"
                                                        : "No records match your search"}
                                                </p>
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {incidents.length === 0
                                                        ? "Records will appear here once incidents are reported."
                                                        : "Adjust the search or filters to see more."}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pageRows.map((record) => {
                                            const sev =
                                                severityConfig[record.severity] ??
                                                severityConfig.Low;
                                            const SeverityIcon = sev.icon;
                                            const st =
                                                statusConfig[record.status] ??
                                                statusConfig.Pending;
                                            const canArchive = [
                                                "Resolved",
                                                "Closed",
                                            ].includes(record.status);

                                            return (
                                                <TableRow
                                                    key={record.incident_id}
                                                    className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                                >
                                                    {/* Record */}
                                                    <TableCell className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.tile}`}
                                                            >
                                                                <SeverityIcon className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                                    {record.title}
                                                                </p>
                                                                <p className="mt-1 font-mono text-[11px] tracking-tight text-slate-700">
                                                                    {record.incident_number}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Category */}
                                                    <TableCell className="py-3">
                                                        <span className="text-[12.5px] text-slate-600">
                                                            {record.category}
                                                        </span>
                                                    </TableCell>

                                                    {/* Location */}
                                                    <TableCell className="py-3">
                                                        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                            {record.location}
                                                        </div>
                                                    </TableCell>

                                                    {/* Severity */}
                                                    <TableCell className="py-3">
                                                        <span className={`${chip} ${sev.chip}`}>
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${sev.dot}`}
                                                            />
                                                            {record.severity}
                                                        </span>
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell className="py-3">
                                                        <span
                                                            className={`${chip} ${st.className}`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${st.dot}`}
                                                            />
                                                            {record.status}
                                                        </span>
                                                    </TableCell>

                                                    {/* Reported By */}
                                                    <TableCell className="py-3">
                                                        <span className="truncate text-[12.5px] text-slate-600">
                                                            {record.reported_by_name}
                                                        </span>
                                                    </TableCell>

                                                    {/* Reported */}
                                                    <TableCell className="py-3">
                                                        <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-600">
                                                            {formatDate(record.created_at)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Actions — 8.4 Archive */}
                                                    <TableCell className="px-5 py-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!canArchive}
                                                            onClick={() => {
                                                                setArchiveTarget(record);
                                                                setArchiveOpen(true);
                                                            }}
                                                            className="h-8 gap-1.5 rounded-lg border-slate-300 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                                                        >
                                                            <Archive className="h-3.5 w-3.5" />
                                                            Archive
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-slate-400">
                                Showing{" "}
                                <span className="font-medium tabular-nums text-slate-700">
                                    {records.length === 0 ? 0 : start + 1}
                                </span>
                                –
                                <span className="font-medium tabular-nums text-slate-700">
                                    {Math.min(start + ROWS_PER_PAGE, records.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium tabular-nums text-slate-700">
                                    {records.length}
                                </span>{" "}
                                records
                            </p>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    aria-label="Previous page"
                                    className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>

                                <span className="px-1 text-[11px] tabular-nums text-slate-500">
                                    {page} / {totalPages}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    aria-label="Next page"
                                    className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 8.4 Archive confirm */}
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[15px]">
                            Archive this record?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[12.5px]">
                            {archiveTarget && (
                                <>
                                    <span className="font-medium text-slate-700">
                                        {archiveTarget.incident_number}
                                    </span>{" "}
                                    ({archiveTarget.title}) will be removed from the active
                                    register. You can restore it later from Archived
                                    Records.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl text-[12.5px]">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmArchive}
                            className="rounded-xl bg-amber-800 text-[12.5px] hover:bg-amber-900"
                        >
                            {archiving ? "Archiving…" : "Archive record"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Siren;
    label: string;
    value: number | string;
    tone: string;
}) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 ${CARD}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}
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
