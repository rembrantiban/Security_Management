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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useIncidentStore } from "@/store/useIncidentReportStore";
import { useRequestStore } from "@/store/useRequestStore";
import { useActivityStore } from "@/store/useActivityStore";
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
import IncidentReportDocument, {
    IncidentReportPrintMount,
} from "@/components/Report/IncidentReportDocument";
import VisitorReportDocument, {
    VisitorReportPrintMount,
} from "@/components/Report/VisitorReportDocument";
import UserActivityReportDocument, {
    UserActivityReportPrintMount,
} from "@/components/Report/UserActivityReportDocument";

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
        description: "Login activity of Security Personnel and Authorized Staff accounts.",
        icon: Activity,
        accent: "bg-blue-50 text-blue-600 ring-blue-100",
        live: true,
    },
    {
        key: "patrol",
        ref: "7.3",
        title: "Patrol Reports",
        description: "Patrol logs, checkpoints scanned, coverage, and missed rounds.",
        icon: Footprints,
        accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
        key: "visitor",
        ref: "7.4",
        title: "Visitor Reports",
        description: "Formal document of processed visitor access requests and their outcomes.",
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
    },
    {
        key: "audit-trail",
        ref: "7.6",
        title: "Audit Trail Reports",
        description: "Chronological record of every security-relevant system event.",
        icon: ScrollText,
        accent: "bg-slate-100 text-slate-600 ring-slate-200",
    },
];

const formats: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "Excel", label: "Excel", icon: FileSpreadsheet },
];

function today() {
    return new Date().toISOString().slice(0, 10);
}

function monthAgo() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
}

type HistoryEntry = {
    id: number;
    title: string;
    format: ExportFormat;
    range: string;
    at: string;
    count?: number;
};

export default function Report() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const { incidents, getAllIncidents } = useIncidentStore();
    const { requests, getAllRequests } = useRequestStore();
    const { logs: activityLogs, getActivityLogs } = useActivityStore();

    const [selected, setSelected] = useState<ReportKey | null>(null);
    const [dateFrom, setDateFrom] = useState(monthAgo());
    const [dateTo, setDateTo] = useState(today());
    const [format, setFormat] = useState<ExportFormat>("PDF");
    const [generating, setGenerating] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        getAllIncidents();
        getAllRequests();
        getActivityLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedType = useMemo(
        () => reportTypes.find((r) => r.key === selected) ?? null,
        [selected]
    );

    const rangeInvalid = dateFrom !== "" && dateTo !== "" && dateFrom > dateTo;
    const canGenerate = !!selectedType && !rangeInvalid && !generating;

    const userName = user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : undefined;

    const meta = (): ReportMeta => ({
        title: selectedType?.title ?? "Report",
        dateFrom,
        dateTo,
        generatedBy: userName,
    });

    // Live models for the currently configured report (only one is active).
    const incidentModel: IncidentReportModel | null = useMemo(() => {
        if (selected !== "incident") return null;
        return buildIncidentReport(incidents, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, incidents, dateFrom, dateTo, userName]);

    const visitorModel: VisitorReportModel | null = useMemo(() => {
        if (selected !== "visitor") return null;
        return buildVisitorReport(requests, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, requests, dateFrom, dateTo, userName]);

    const userActivityModel: UserActivityReportModel | null = useMemo(() => {
        if (selected !== "user-activity") return null;
        return buildUserActivityReport(activityLogs, meta());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, activityLogs, dateFrom, dateTo, userName]);

    const liveCount =
        incidentModel?.summary.total ??
        visitorModel?.summary.total ??
        userActivityModel?.summary.total ??
        null;
    const isLiveReport = !!(
        incidentModel ||
        visitorModel ||
        userActivityModel
    );

    const pushHistory = (count?: number) => {
        if (!selectedType) return;
        setHistory((prev) => [
            {
                id: Date.now(),
                title: selectedType.title,
                format,
                range: rangeLabel(meta()),
                at: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                count,
            },
            ...prev,
        ]);
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
        if (!selectedType || rangeInvalid) return;

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

    const handleSecondaryAction = () => {
        if (!selectedType) return;

        if (isLiveReport) {
            runReport(format === "Excel" ? "Excel" : "PDF");
            return;
        }

        window.print();
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
                            <FileBarChart2 className="h-3 w-3" />
                            Reporting &amp; Analytics
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            Reports Center
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Generate, export, and print operational reports across incidents,
                            personnel, patrols, visitors, and system activity.
                        </p>
                    </div>

                    <Button
                        onClick={handleGenerate}
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
            <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        Report type
                    </p>
                    {selectedType && (
                        <span className="text-[11px] text-slate-400">
                            {selectedType.ref} selected
                        </span>
                    )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                                        ? "bg-white ring-2 ring-amber-300"
                                        : "bg-white/60 ring-1 ring-slate-200 hover:bg-white hover:ring-slate-300"
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
            <div className="grid gap-2 lg:grid-cols-3">

                {/* Configuration */}
                <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        Parameters
                    </p>

                    {!selectedType ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 py-12 text-center ring-1 ring-slate-200">
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
                        <div className="mt-4 space-y-4">

                            {/* Date range */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                    <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                                    Date range
                                </label>

                                <div className="mt-1.5 grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        max={dateTo || undefined}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="h-9 rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus-visible:bg-white focus-visible:ring-amber-300"
                                    />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        min={dateFrom || undefined}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="h-9 rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus-visible:bg-white focus-visible:ring-amber-300"
                                    />
                                </div>

                                {rangeInvalid && (
                                    <p className="mt-1.5 text-[11px] text-red-600">
                                        The start date must be on or before the end date.
                                    </p>
                                )}
                            </div>

                            {/* Format */}
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

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                <Button
                                    onClick={handleGenerate}
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
                                          } in range`
                                        : selectedType.title}
                                </span>
                            </div>

                        </div>
                    )}
                </div>

                {/* Recent reports */}
                <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        Recent reports
                    </p>

                    {history.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 py-12 text-center ring-1 ring-slate-200">
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
                        <ul className="mt-3 space-y-1.5">
                            {history.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex items-center gap-3 rounded-xl bg-white/70 p-2.5 ring-1 ring-slate-200"
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
            {(incidentModel || visitorModel || userActivityModel) && (
                <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                            Document preview
                        </p>
                        <span className="text-[11px] text-slate-400">
                            {(incidentModel ?? visitorModel ?? userActivityModel)
                                ?.reference}
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
                </div>
            )}

            {incidentModel && <IncidentReportPrintMount model={incidentModel} />}
            {visitorModel && <VisitorReportPrintMount model={visitorModel} />}
            {userActivityModel && (
                <UserActivityReportPrintMount model={userActivityModel} />
            )}
        </div>
    );
}
