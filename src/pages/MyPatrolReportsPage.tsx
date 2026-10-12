import { useEffect, useMemo, useState } from "react";
import {
    CalendarRange,
    FileText,
    FileSpreadsheet,
    Printer,
    Download,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { usePatrolStore } from "@/store/usePatrolStore";
import {
    buildPatrolReport,
    downloadPatrolReportExcel,
    type PatrolReportModel,
    type ReportMeta,
} from "@/lib/reports/patrolReport";
import PatrolReportDocument, {
    PatrolReportPrintMount,
} from "@/components/Report/PatrolReportDocument";

import PageHeader, { HEADER_PRIMARY_BUTTON } from "@/components/layout/PageHeader";

type ExportFormat = "PDF" | "Excel";

const formats: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "Excel", label: "Excel", icon: FileSpreadsheet },
];

export default function MyPatrolReportsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const { completedPatrols, getMyCompletedPatrols } = usePatrolStore();

    const [format, setFormat] = useState<ExportFormat>("PDF");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        getMyCompletedPatrols();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const userName = user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : undefined;

    // The report always covers every completed patrol — no date-range filter.
    const patrolModel: PatrolReportModel = useMemo(() => {
        const meta: ReportMeta = {
            title: "Patrol Activity Report",
            dateFrom: "",
            dateTo: "",
            generatedBy: userName,
        };
        return buildPatrolReport(completedPatrols, meta);
    }, [completedPatrols, userName]);

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
            <PageHeader
                eyebrow="Personnel reporting"
                title="Patrol Activity Report"
                description="Generate a formal record of your completed patrols as a PDF or Excel file."
                actions={
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={HEADER_PRIMARY_BUTTON}
                    >
                        {generating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        {generating ? "Generating…" : "Generate report"}
                    </Button>
                }
            />

            {/* Parameters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 ring-0">
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
                            onClick={() => runPatrolExport(format)}
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
                            {patrolModel.summary.total} completed patrol
                            {patrolModel.summary.total === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 ring-0">
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
        </div>
    );
}
