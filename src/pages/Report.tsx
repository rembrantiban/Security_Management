import { useEffect, useMemo, useState } from "react";
import {
    FileBarChart2,
    Siren,
    Activity,
    Footprints,
    IdCard,
    Gauge,
    ScrollText,
    FileSpreadsheet,
    FileText,
    Printer,
    Loader2,
    Check,
    CalendarRange,
    Clock3,
    Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useIncidentStore } from "@/store/useIncidentReportStore";
import { useRequestStore } from "@/store/useRequestStore";
import { usePatrolStore } from "@/store/usePatrolStore";
import { useReportGenerationStore } from "@/store/useReportGenerationStore";
import {
    buildIncidentReport,
    downloadIncidentReportExcel,
    rangeLabel,
    type IncidentReportModel,
    type ReportMeta,
} from "@/lib/reports/incidentReport";
import {
    buildVisitorReport,
    downloadVisitorReportExcel,
    type VisitorReportModel,
} from "@/lib/reports/visitorReport";
import {
    buildUserActivityReport,
    downloadUserActivityReportExcel,
    type UserActivityReportModel,
} from "@/lib/reports/userActivityReport";
import {
    buildPatrolReport,
    downloadPatrolReportExcel,
    type PatrolReportModel,
} from "@/lib/reports/patrolReport";
import {
    buildAuditTrailReport,
    downloadAuditTrailReportExcel,
    type AuditEvent,
    type AuditTrailReportModel,
} from "@/lib/reports/auditTrailReport";
import {
    buildSecurityPerformanceReport,
    downloadSecurityPerformanceReportExcel,
    type SecurityPerformanceReportModel,
} from "@/lib/reports/securityPerformanceReport";
import IncidentReportDocument, {
    IncidentReportPrintMount,
} from "@/components/Report/IncidentReportDocument";
import VisitorReportDocument, {
    VisitorReportPrintMount,
} from "@/components/Report/VisitorReportDocument";
import UserActivityReportDocument, {
    UserActivityReportPrintMount,
} from "@/components/Report/UserActivityReportDocument";
import PatrolReportDocument, {
    PatrolReportPrintMount,
} from "@/components/Report/PatrolReportDocument";
import AuditTrailReportDocument, {
    AuditTrailReportPrintMount,
} from "@/components/Report/AuditTrailReportDocument";
import SecurityPerformanceReportDocument, {
    SecurityPerformanceReportPrintMount,
} from "@/components/Report/SecurityPerformanceReportDocument";
import GenerateReportModal from "@/components/Report/GenerateReportModal";
import AllReportsModal from "@/components/Report/AllReportsModal";

type ReportKey =
    | "incident"
    | "user-activity"
    | "patrol"
    | "visitor"
    | "security-performance"
    | "audit-trail";

type ExportFormat = "PDF" | "Excel";

type ReportType = {
    key: ReportKey;
    ref: string;
    title: string;
    description: string;
    icon: typeof Siren;
    accent: string;
    live?: boolean;
};

const reportTypes: ReportType[] = [
    {
        key: "incident",
        ref: "7.1",
        title: "Incident Reports",
        description: "Formal document of incidents that have been resolved and closed.",
        icon: Siren,
        accent: "bg-red-50 text-red-600 ring-red-100",
        live: true,
    },
    {
        key: "user-activity",
        ref: "7.2",
        title: "User Activity Reports",
        description:
            "Visitor requests, patrol rounds, and incident reports handled by personnel.",
        icon: Activity,
        accent: "bg-blue-50 text-blue-600 ring-blue-100",
        live: true,
    },
    {
        key: "patrol",
        ref: "7.3",
        title: "Patrol Reports",
        description:
            "Record of completed patrols — areas covered, timing, and observations.",
        icon: Footprints,
        accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        live: true,
    },
    {
        key: "visitor",
        ref: "7.4",
        title: "Visitor Reports",
        description:
            "Record of completed visits — visitors whose exit has been recorded.",
        icon: IdCard,
        accent: "bg-amber-50 text-amber-700 ring-amber-100",
        live: true,
    },
    {
        key: "security-performance",
        ref: "7.5",
        title: "Security Performance Reports",
        description: "Response times, resolution rates, and personnel effectiveness.",
        icon: Gauge,
        accent: "bg-violet-50 text-violet-600 ring-violet-100",
        live: true,
    },
    {
        key: "audit-trail",
        ref: "7.6",
        title: "Audit Trail Reports",
        description:
            "Chronological record of reports generated from this Reports Center.",
        icon: ScrollText,
        accent: "bg-slate-100 text-slate-600 ring-slate-200",
        live: true,
    },
];

const formats: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "Excel", label: "Excel", icon: FileSpreadsheet },
];

// Shared visual-layer tokens — keeps every panel on the same card, blur, and
// label treatment so the page reads as one system instead of six one-offs.
const CARD =
    "rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/70";
const SECTION_LABEL =
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500";
const EMPTY_STATE =
    "flex flex-col items-center justify-center rounded-xl bg-slate-50/80 py-12 text-center ring-1 ring-slate-200/70";

type HistoryEntry = {
    id: number;
    title: string;
    format: ExportFormat;
    range: string;
    at: string;
    iso: string;
    actor: string;
    count?: number;
};

export default function Report() {
    const { showToast } = useToast();
    const { user, users, getAllUsers } = useAuth();
    const { incidents, getAllIncidents } = useIncidentStore();
    const { requests, getAllRequests } = useRequestStore();
    const { allPatrolLogs, getAllPatrolLogs } = usePatrolStore();
    const {
        history: reportGenerations,
        getReportGenerations,
        logReportGeneration,
    } = useReportGenerationStore();

    const [selected, setSelected] = useState<ReportKey | null>(null);
    const [format, setFormat] = useState<ExportFormat>("PDF");
    const [generating, setGenerating] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);
    const [allReportsOpen, setAllReportsOpen] = useState(false);

    useEffect(() => {
        getAllIncidents();
        getAllRequests();
        getAllPatrolLogs();
        getAllUsers();
        getReportGenerations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The "Recent reports" list and Audit Trail report are backed by the
    // persisted report_generations table; shape each row for the UI.
    const history: HistoryEntry[] = useMemo(
        () =>
            reportGenerations.map((row) => ({
                id: row.report_generation_id,
                title: row.title,
                format: row.export_format,
                range: row.range_label,
                at: new Date(row.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                iso: row.created_at,
                actor: row.generated_by_name ?? "System",
                count: row.record_count ?? undefined,
            })),
        [reportGenerations]
    );

    const selectedType = useMemo(
        () => reportTypes.find((r) => r.key === selected) ?? null,
        [selected]
    );

    const canGenerate = !!selectedType && !generating;

    const userName = user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : undefined;

    // Reports always cover every available record — no date-range filtering.
    const meta = (): ReportMeta => ({
        title: selectedType?.title ?? "Report",
        dateFrom: "",
        dateTo: "",
        generatedBy: userName,
    });

    // Live models for the currently configured report (only one is active).
    const incidentModel: IncidentReportModel | null = useMemo(() => {
        if (selected !== "incident") return null;
        return buildIncidentReport(incidents, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, incidents, userName]);

    const visitorModel: VisitorReportModel | null = useMemo(() => {
        if (selected !== "visitor") return null;
        return buildVisitorReport(requests, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, requests, userName]);

    const userActivityModel: UserActivityReportModel | null = useMemo(() => {
        if (selected !== "user-activity") return null;
        return buildUserActivityReport(
            { requests, patrolLogs: allPatrolLogs, incidents, users },
            meta()
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, requests, allPatrolLogs, incidents, users, userName]);

    const patrolModel: PatrolReportModel | null = useMemo(() => {
        if (selected !== "patrol") return null;
        return buildPatrolReport(allPatrolLogs, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, allPatrolLogs, userName]);

    const performanceModel: SecurityPerformanceReportModel | null = useMemo(() => {
        if (selected !== "security-performance") return null;
        return buildSecurityPerformanceReport(
            {
                incidents,
                patrolLogs: allPatrolLogs,
                requests,
                users,
            },
            meta()
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, incidents, allPatrolLogs, requests, users, userName]);

    const auditModel: AuditTrailReportModel | null = useMemo(() => {
        if (selected !== "audit-trail") return null;

        const events: AuditEvent[] = history.map((entry) => ({
            id: entry.id,
            at: entry.iso,
            actor: entry.actor,
            action: `Generated ${entry.title}`,
            target: entry.title,
            format: entry.format,
            detail:
                (entry.count !== undefined ? `${entry.count} records · ` : "") +
                entry.range,
        }));

        return buildAuditTrailReport(events, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, history, userName]);

    const liveCount =
        incidentModel?.summary.total ??
        visitorModel?.summary.total ??
        userActivityModel?.summary.total ??
        patrolModel?.summary.total ??
        performanceModel?.summary.total ??
        auditModel?.summary.total ??
        null;
    const isLiveReport = !!(
        incidentModel ||
        visitorModel ||
        userActivityModel ||
        patrolModel ||
        performanceModel ||
        auditModel
    );

    const pushHistory = (count?: number) => {
        if (!selectedType) return;

        // Persist to the backend; the store prepends the saved row to `history`
        // on success. Fire-and-forget — a failed audit write never blocks the
        // report the user just ran.
        void logReportGeneration({
            report_key: selectedType.key,
            report_ref: selectedType.ref,
            title: selectedType.title,
            export_format: format,
            date_from: null,
            date_to: null,
            range_label: rangeLabel(meta()),
            record_count: count ?? null,
        });
    };

    const exportExcel = (): number | null => {
        if (incidentModel) {
            downloadIncidentReportExcel(incidentModel);
            return incidentModel.summary.total;
        }
        if (visitorModel) {
            downloadVisitorReportExcel(visitorModel);
            return visitorModel.summary.total;
        }
        if (userActivityModel) {
            downloadUserActivityReportExcel(userActivityModel);
            return userActivityModel.summary.total;
        }
        if (patrolModel) {
            downloadPatrolReportExcel(patrolModel);
            return patrolModel.summary.total;
        }
        if (performanceModel) {
            downloadSecurityPerformanceReportExcel(performanceModel);
            return performanceModel.summary.total;
        }
        if (auditModel) {
            downloadAuditTrailReportExcel(auditModel);
            return auditModel.summary.total;
        }
        return null;
    };

    const runReport = (fmt: ExportFormat) => {
        if (fmt === "Excel") {
            const n = exportExcel();
            if (n === null) return;
            pushHistory(n);
            showToast(
                "success",
                "Excel exported",
                `${n} record${n === 1 ? "" : "s"} downloaded.`
            );
            return;
        }

        // PDF — the on-page document is isolated and printed via @media print.
        pushHistory(liveCount ?? undefined);
        window.print();
    };

    const handleGenerate = async () => {
        if (!selectedType) return;

        if (isLiveReport) {
            setGenerating(true);
            runReport(format);
            setGenerating(false);
            return;
        }

        // Report types without a data source yet.
        setGenerating(true);
        await new Promise((resolve) => setTimeout(resolve, 900));
        pushHistory();
        setGenerating(false);
        showToast(
            "info",
            "Not available yet",
            `${selectedType.title} has no connected data source.`
        );
    };

    const confirmGenerate = async () => {
        if (!selectedType) return;

        // Close the modal and let its exit animation finish before the browser
        // print dialog fires, so only the report document prints — the print
        // stylesheet below is the safety net if the dialog is still animating.
        setGenerateOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 180));
        await handleGenerate();
    };

    const handleSecondaryAction = () => {
        if (!selectedType) return;

        if (isLiveReport) {
            runReport(format === "Excel" ? "Excel" : "PDF");
            return;
        }

        window.print();
    };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm ring-1 ring-black/5">

                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                            <FileBarChart2 className="h-3 w-3" />
                            Reporting &amp; Analytics
                        </span>

                        <h1 className="mt-3 text-[19px] font-semibold tracking-tight text-white">
                            Reports Center
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Generate, export, and print operational reports across incidents,
                            personnel, patrols, visitors, and system activity.
                        </p>
                    </div>

                    <Button
                        onClick={() => setGenerateOpen(true)}
                        disabled={!canGenerate}
                        className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50 disabled:opacity-60"
                    >
                        {generating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        {generating ? "Generating…" : "Generate report"}
                    </Button>

                </div>
            </div>

            {/* Report type picker */}
            <div className={`${CARD} p-5`}>
                <div className="mb-4 flex items-center justify-between">
                    <p className={SECTION_LABEL}>Report type</p>
                    {selectedType && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
                            {selectedType.ref} selected
                        </span>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {reportTypes.map((type) => {
                        const Icon = type.icon;
                        const active = selected === type.key;

                        return (
                            <button
                                key={type.key}
                                type="button"
                                onClick={() => setSelected(type.key)}
                                className={`group relative flex flex-col rounded-xl p-4 text-left transition-all duration-200 ${
                                    active
                                        ? "bg-amber-50/50 shadow-sm ring-2 ring-amber-300"
                                        : "bg-white/70 ring-1 ring-slate-200/80 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm hover:ring-slate-300"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${type.accent}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
                                            active
                                                ? "bg-amber-800 text-white"
                                                : "bg-slate-100 text-transparent group-hover:bg-slate-200"
                                        }`}
                                    >
                                        <Check className="h-3 w-3" />
                                    </span>
                                </div>

                                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-slate-900">
                                    {type.title}
                                    {type.live && (
                                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-100">
                                            Live
                                        </span>
                                    )}
                                </p>

                                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
                                    {type.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Configuration + history */}
            <div className="grid gap-4 lg:grid-cols-3">

                {/* Configuration */}
                <div className={`${CARD} p-5 lg:col-span-2`}>
                    <p className={SECTION_LABEL}>Parameters</p>

                    {!selectedType ? (
                        <div className={`mt-4 ${EMPTY_STATE}`}>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                                <FileBarChart2 className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                Select a report type
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Choose one of the report types above to set its parameters.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 divide-y divide-slate-100">

                            {/* Coverage note */}
                            <div className="flex items-center gap-1.5 pb-4 text-[11px] text-slate-500">
                                <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                                Covers all available records
                            </div>

                            {/* Format */}
                            <div className="py-4">
                                <p className="text-[11px] font-medium text-slate-600">
                                    Export format
                                </p>

                                <div className="mt-2 inline-flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
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

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-4">
                                <Button
                                    onClick={() => setGenerateOpen(true)}
                                    disabled={!canGenerate}
                                    className="h-9 gap-2 rounded-xl bg-amber-800 px-4 text-[12.5px] font-medium text-white hover:bg-amber-900 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    {generating ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    {generating
                                        ? "Generating…"
                                        : `Generate ${format}`}
                                </Button>

                                <Button
                                    onClick={handleSecondaryAction}
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
                                    {liveCount !== null
                                        ? `${liveCount} record${
                                              liveCount === 1 ? "" : "s"
                                          }`
                                        : selectedType.title}
                                </span>
                            </div>

                        </div>
                    )}
                </div>

                {/* Recent reports */}
                <div className={`${CARD} p-5`}>
                    <div className="flex items-center justify-between">
                        <p className={SECTION_LABEL}>Recent reports</p>

                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setAllReportsOpen(true)}
                                className="text-[11px] font-medium text-amber-800 transition hover:underline"
                            >
                                View all ({history.length})
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className={`mt-4 ${EMPTY_STATE}`}>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                                <Clock3 className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="mt-3 text-[12.5px] font-medium text-slate-700">
                                Nothing generated yet
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Reports you generate appear here.
                            </p>
                        </div>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {history.slice(0, 3).map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex items-center gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-slate-200/80"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                                        {entry.format === "PDF" ? (
                                            <FileText className="h-3.5 w-3.5" />
                                        ) : (
                                            <FileSpreadsheet className="h-3.5 w-3.5" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12.5px] font-medium text-slate-900">
                                            {entry.title}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                            {entry.count !== undefined
                                                ? `${entry.count} records · `
                                                : ""}
                                            {entry.range} · {entry.at}
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                                        {entry.format}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {/* Document preview */}
            {(incidentModel ||
                visitorModel ||
                userActivityModel ||
                patrolModel ||
                performanceModel ||
                auditModel) && (
                <div className={`${CARD} p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                        <p className={SECTION_LABEL}>Document preview</p>
                        <span className="text-[11px] text-slate-400">
                            {(
                                incidentModel ??
                                visitorModel ??
                                userActivityModel ??
                                patrolModel ??
                                performanceModel ??
                                auditModel
                            )?.reference}
                        </span>
                    </div>

                    {incidentModel && (
                        <IncidentReportDocument
                            model={incidentModel}
                            maxHeight="70vh"
                        />
                    )}
                    {visitorModel && (
                        <VisitorReportDocument
                            model={visitorModel}
                            maxHeight="70vh"
                        />
                    )}
                    {userActivityModel && (
                        <UserActivityReportDocument
                            model={userActivityModel}
                            maxHeight="70vh"
                        />
                    )}
                    {patrolModel && (
                        <PatrolReportDocument
                            model={patrolModel}
                            maxHeight="70vh"
                        />
                    )}
                    {performanceModel && (
                        <SecurityPerformanceReportDocument
                            model={performanceModel}
                            maxHeight="70vh"
                        />
                    )}
                    {auditModel && (
                        <AuditTrailReportDocument
                            model={auditModel}
                            maxHeight="70vh"
                        />
                    )}
                </div>
            )}

            {/*
                Print safety net: the report documents inject their own print
                stylesheet that hides #root and shows only the portalled
                document. Any open dialog is portalled to <body> (outside #root),
                so hide it explicitly — this guarantees the printed page is
                identical to the "Document preview" panel above.
            */}
            <style>{`
                @media print {
                    [data-slot="dialog-overlay"],
                    [data-slot="dialog-content"],
                    [data-slot="dialog-portal"] {
                        display: none !important;
                    }
                }
            `}</style>

            {incidentModel && <IncidentReportPrintMount model={incidentModel} />}
            {visitorModel && <VisitorReportPrintMount model={visitorModel} />}
            {userActivityModel && (
                <UserActivityReportPrintMount model={userActivityModel} />
            )}
            {patrolModel && <PatrolReportPrintMount model={patrolModel} />}
            {performanceModel && (
                <SecurityPerformanceReportPrintMount model={performanceModel} />
            )}
            {auditModel && <AuditTrailReportPrintMount model={auditModel} />}

            <GenerateReportModal
                open={generateOpen}
                onOpenChange={setGenerateOpen}
                target={
                    selectedType
                        ? {
                              title: selectedType.title,
                              reference: selectedType.ref,
                              description: selectedType.description,
                              icon: selectedType.icon,
                              accent: selectedType.accent,
                              live: selectedType.live,
                          }
                        : null
                }
                format={format}
                onFormatChange={setFormat}
                recordCount={liveCount}
                isLiveReport={isLiveReport}
                generating={generating}
                onConfirm={confirmGenerate}
            />

            <AllReportsModal
                open={allReportsOpen}
                onOpenChange={setAllReportsOpen}
            />
        </div>
    );
}