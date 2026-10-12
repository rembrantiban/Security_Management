import { useEffect, useMemo, useState } from "react";
import {
    Archive,
    ArchiveRestore,
    ArrowDown,
    ArrowUp,
    CalendarCheck,
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
import { useToast } from "@/hooks/useToast";
import { useIncidentStore, type Incident } from "@/store/useIncidentReportStore";
import {
    exportSecurityRecordsExcel,
    filterIncidentRecords,
} from "@/lib/securityRecords";
import { INCIDENT_CHIP, SEVERITY_CONFIG } from "@/components/Incident/incidentUi";
import PageHeader from "@/components/layout/PageHeader";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const CARD = "rounded-2xl border border-gray-200 bg-white ring-0";
const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

/** The Security Records register only covers incidents that have been closed. */
const RECORD_STATUS: Incident["status"] = "Closed";

const SEVERITY_OPTIONS = ["all", "Critical", "High", "Medium", "Low"];
const ROWS_PER_PAGE = 8;

type View = "closed" | "archived";
type PendingAction = { type: "archive" | "restore"; record: Incident };

const VIEW_COPY: Record<View, { label: string; exportLabel: string; dateLabel: string }> = {
    closed: { label: "Closed records", exportLabel: "Closed Security Records", dateLabel: "Closed" },
    archived: { label: "Archived", exportLabel: "Archived Security Records", dateLabel: "Archived" },
};

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
        <PageHeader
            eyebrow="Security records management"
            title="Security Records"
            description="The register of closed security incidents. Search and filter records, archive them for retention, restore archived ones, and export the register."
        />
    );
}

/* ------------------------------------------------------------------ */
/* Module                                                             */
/* ------------------------------------------------------------------ */

function RecordsModule() {
    const incidents = useIncidentStore((s) => s.incidents);
    const archivedIncidents = useIncidentStore((s) => s.archivedIncidents);
    const isLoading = useIncidentStore((s) => s.isLoading);
    const isFetchingArchived = useIncidentStore((s) => s.isFetchingArchived);
    const getAllIncidents = useIncidentStore((s) => s.getAllIncidents);
    const getArchivedIncidents = useIncidentStore((s) => s.getArchivedIncidents);
    const archiveIncident = useIncidentStore((s) => s.archiveIncident);
    const restoreIncident = useIncidentStore((s) => s.restoreIncident);
    const { showToast } = useToast();

    const [view, setView] = useState<View>("closed");
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("all");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const [pending, setPending] = useState<PendingAction | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getAllIncidents();
        getArchivedIncidents();
    }, [getAllIncidents, getArchivedIncidents]);

    // Only closed incidents belong in the register, in either tab.
    const closedRecords = useMemo(
        () => incidents.filter((i) => i.status === RECORD_STATUS),
        [incidents]
    );
    const archivedRecords = useMemo(
        () => archivedIncidents.filter((i) => i.status === RECORD_STATUS),
        [archivedIncidents]
    );

    const source = view === "closed" ? closedRecords : archivedRecords;
    const loadingSource = view === "closed" ? isLoading : isFetchingArchived;

    // 8.1 View · 8.2 Search · 8.3 Filter — sorted by the closed / archived date.
    const records = useMemo(() => {
        const rows = filterIncidentRecords(source, {
            search,
            severity,
            status: "all",
            includeClosed: true,
        });

        return rows.sort((a, b) => {
            const diff =
                new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            return sortDir === "asc" ? diff : -diff;
        });
    }, [source, search, severity, sortDir]);

    const hasFilters = search.trim() !== "" || severity !== "all";

    // Back to the first page whenever the result set changes shape.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [view, search, severity, sortDir]);

    const totalPages = Math.max(1, Math.ceil(records.length / ROWS_PER_PAGE));
    // Archiving / restoring the last row of the last page must not strand the view.
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const pageRows = records.slice(start, start + ROWS_PER_PAGE);

    const stats = useMemo(
        () => ({
            closed: closedRecords.length,
            archived: archivedRecords.length,
            highPriority: closedRecords.filter(
                (r) => r.severity === "Critical" || r.severity === "High"
            ).length,
            total: closedRecords.length + archivedRecords.length,
        }),
        [closedRecords, archivedRecords]
    );

    const clearFilters = () => {
        setSearch("");
        setSeverity("all");
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([getAllIncidents(), getArchivedIncidents()]);
        setRefreshing(false);
    };

    // 8.6 Export Security Records — exports the current tab's filtered rows.
    const handleExport = () => {
        if (records.length === 0) {
            showToast("info", "Nothing to export", "No records match the current search and filters.");
            return;
        }

        exportSecurityRecordsExcel(records, VIEW_COPY[view].exportLabel);
        showToast(
            "success",
            "Export ready",
            `${records.length} record${records.length === 1 ? "" : "s"} exported to Excel.`
        );
    };

    // 8.4 Archive · 8.5 Restore
    const confirmPending = async () => {
        if (!pending) return;

        const { type, record } = pending;
        setSubmitting(true);
        const success =
            type === "archive"
                ? await archiveIncident(record.incident_id)
                : await restoreIncident(record.incident_id);
        setSubmitting(false);

        if (success) {
            showToast(
                "success",
                type === "archive" ? "Record archived" : "Record restored",
                type === "archive"
                    ? `${record.incident_number} has been moved to the archive.`
                    : `${record.incident_number} is back in the closed records register.`
            );
            setPending(null);
            return;
        }

        showToast(
            "error",
            type === "archive" ? "Archive failed" : "Restore failed",
            useIncidentStore.getState().error ??
                `Unable to ${type} this record. Please try again.`
        );
    };

    return (
        <div className="space-y-2">
            <RecordsHeader />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <StatCard
                    icon={ShieldCheck}
                    label="Closed records"
                    value={stats.closed}
                    tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
                />
                <StatCard
                    icon={Siren}
                    label="Closed critical / high"
                    value={stats.highPriority}
                    tone="bg-red-50 text-red-600 ring-red-100"
                />
                <StatCard
                    icon={Archive}
                    label="Archived"
                    value={stats.archived}
                    tone="bg-amber-50 text-amber-700 ring-amber-100"
                />
                <StatCard
                    icon={FileText}
                    label="Total in register"
                    value={stats.total}
                    tone="bg-slate-50 text-slate-600 ring-slate-200"
                />
            </div>

            {/* Toolbar */}
            <div className={CARD}>
                {/* Row 1 — tabs + register-level actions */}
                <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        role="tablist"
                        aria-label="Security records view"
                        className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto"
                    >
                        {(["closed", "archived"] as const).map((key) => {
                            const active = view === key;
                            const Icon = key === "closed" ? ShieldCheck : Archive;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setView(key)}
                                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition sm:flex-none ${
                                        active
                                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${active ? "text-amber-700" : ""}`} />
                                    {VIEW_COPY[key].label}
                                    <span
                                        className={`rounded-md px-1.5 text-[10.5px] tabular-nums ${
                                            active ? "bg-slate-100 text-slate-700" : "text-slate-400"
                                        }`}
                                    >
                                        {key === "closed" ? stats.closed : stats.archived}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

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
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
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
                            aria-label="Search records"
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

                        <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                            <SelectTrigger className="h-9 w-full rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-40">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {SEVERITY_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option} className="text-[12.5px]">
                                        {option === "all" ? "All severity" : option}
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
                                <TableHead className={`${headCell} px-5`}>Record</TableHead>
                                <TableHead className={headCell}>Category</TableHead>
                                <TableHead className={headCell}>Location</TableHead>
                                <TableHead className={headCell}>Severity</TableHead>
                                <TableHead className={headCell}>Reported By</TableHead>
                                <TableHead className={headCell}>Handled By</TableHead>
                                <TableHead className={headCell}>Reported</TableHead>
                                <TableHead className={headCell}>
                                    <button
                                        type="button"
                                        onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                                        className="inline-flex items-center gap-1 uppercase tracking-[0.1em] text-slate-400 transition hover:text-slate-700"
                                        aria-label={`Sort by ${VIEW_COPY[view].dateLabel.toLowerCase()} date`}
                                    >
                                        {VIEW_COPY[view].dateLabel}
                                        {sortDir === "asc" ? (
                                            <ArrowUp className="h-3 w-3" />
                                        ) : (
                                            <ArrowDown className="h-3 w-3" />
                                        )}
                                    </button>
                                </TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loadingSource && source.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={9} className="py-16 text-center">
                                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                                        <p className="mt-3 text-[12px] text-slate-500">Loading records…</p>
                                    </TableCell>
                                </TableRow>
                            ) : pageRows.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={9} className="py-16 text-center">
                                        <EmptyRecords
                                            view={view}
                                            filtered={source.length > 0}
                                            onClear={clearFilters}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageRows.map((record) => (
                                    <RecordRow
                                        key={record.incident_id}
                                        record={record}
                                        view={view}
                                        onAction={(type) => setPending({ type, record })}
                                    />
                                ))
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
                        <span className="font-medium tabular-nums text-slate-700">{records.length}</span>{" "}
                        {view === "closed" ? "closed" : "archived"} records
                    </p>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => setPage(currentPage - 1)}
                            aria-label="Previous page"
                            className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>

                        <span className="px-1 text-[11px] tabular-nums text-slate-500">
                            {currentPage} / {totalPages}
                        </span>

                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage(currentPage + 1)}
                            aria-label="Next page"
                            className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 8.4 Archive / 8.5 Restore confirm */}
            <AlertDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open && !submitting) setPending(null);
                }}
            >
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[15px]">
                            {pending?.type === "restore" ? "Restore this record?" : "Archive this record?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[12.5px]">
                            {pending && (
                                <>
                                    <span className="font-medium text-slate-700">
                                        {pending.record.incident_number}
                                    </span>{" "}
                                    ({pending.record.title}){" "}
                                    {pending.type === "restore"
                                        ? "will be moved back into the closed records register."
                                        : "will be moved out of the closed records register into the archive. You can restore it at any time from the Archived tab."}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting} className="rounded-xl text-[12.5px]">
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={confirmPending}
                            disabled={submitting}
                            className="gap-1.5 rounded-xl bg-amber-800 text-[12.5px] text-white hover:bg-amber-900"
                        >
                            {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : pending?.type === "restore" ? (
                                <ArchiveRestore className="h-3.5 w-3.5" />
                            ) : (
                                <Archive className="h-3.5 w-3.5" />
                            )}
                            {pending?.type === "restore"
                                ? submitting
                                    ? "Restoring…"
                                    : "Restore record"
                                : submitting
                                  ? "Archiving…"
                                  : "Archive record"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Row                                                                */
/* ------------------------------------------------------------------ */

function RecordRow({
    record,
    view,
    onAction,
}: {
    record: Incident;
    view: View;
    onAction: (type: PendingAction["type"]) => void;
}) {
    const sev = SEVERITY_CONFIG[record.severity] ?? SEVERITY_CONFIG.Low;
    const SeverityIcon = sev.icon;

    return (
        <TableRow className="border-slate-100 transition-colors duration-200 hover:bg-slate-50">
            {/* Record */}
            <TableCell className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.tile}`}
                    >
                        <SeverityIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="max-w-56 truncate text-[13px] font-medium leading-none text-slate-900">
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
                <span className="text-[12.5px] text-slate-600">{record.category}</span>
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
                <span className={`${INCIDENT_CHIP} ${sev.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                    {record.severity}
                </span>
            </TableCell>

            {/* Reported By */}
            <TableCell className="py-3">
                <span className="truncate text-[12.5px] text-slate-600">{record.reported_by_name}</span>
            </TableCell>

            {/* Handled By */}
            <TableCell className="py-3">
                <span className="truncate text-[12.5px] text-slate-600">
                    {record.assigned_to_name ?? <span className="text-slate-400">—</span>}
                </span>
            </TableCell>

            {/* Reported */}
            <TableCell className="py-3">
                <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-600">
                    {formatDate(record.created_at)}
                </span>
            </TableCell>

            {/* Closed / Archived */}
            <TableCell className="py-3">
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] tabular-nums text-slate-600">
                    <CalendarCheck className="h-3 w-3 text-slate-400" />
                    {formatDate(record.updated_at)}
                </span>
            </TableCell>

            {/* Actions */}
            <TableCell className="px-5 py-3 text-right">
                {view === "closed" ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction("archive")}
                        className="h-8 gap-1.5 rounded-lg border-slate-300 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction("restore")}
                        className="h-8 gap-1.5 rounded-lg border-emerald-200 text-[12px] text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                        Restore
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyRecords({
    view,
    filtered,
    onClear,
}: {
    view: View;
    filtered: boolean;
    onClear: () => void;
}) {
    const Icon = filtered ? SearchX : view === "closed" ? ShieldCheck : Archive;

    return (
        <>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                <Icon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-[13px] font-medium text-slate-700">
                {filtered
                    ? "No records match your search"
                    : view === "closed"
                      ? "No closed records"
                      : "No archived records"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
                {filtered
                    ? "Adjust the search or filters to see more."
                    : view === "closed"
                      ? "Incidents appear here once they have been closed."
                      : "Closed records you archive will appear here."}
            </p>
            {filtered && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-2 text-[11px] font-medium text-amber-800 hover:underline"
                >
                    Clear filters
                </button>
            )}
        </>
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
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 leading-tight">
                <p className="text-[18px] font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
                <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
}
