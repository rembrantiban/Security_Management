import type { LucideIcon } from "lucide-react";
import {
    CalendarRange,
    Check,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Printer,
    TriangleAlert,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ExportFormat = "PDF" | "Excel";

export type GenerateReportTarget = {
    title: string;
    reference: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    live?: boolean;
};

type GenerateReportModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    target: GenerateReportTarget | null;
    rangeLabel: string;
    format: ExportFormat;
    onFormatChange: (format: ExportFormat) => void;
    recordCount: number | null;
    isLiveReport: boolean;
    generating: boolean;
    onConfirm: () => void;
};

const formatOptions: { value: ExportFormat; label: string; icon: LucideIcon }[] = [
    { value: "PDF", label: "PDF", icon: FileText },
    { value: "Excel", label: "Excel", icon: FileSpreadsheet },
];

export default function GenerateReportModal({
    open,
    onOpenChange,
    target,
    rangeLabel,
    format,
    onFormatChange,
    recordCount,
    isLiveReport,
    generating,
    onConfirm,
}: GenerateReportModalProps) {
    if (!target) return null;

    const Icon = target.icon;
    const recordsLabel =
        recordCount !== null
            ? `${recordCount} record${recordCount === 1 ? "" : "s"} in range`
            : "No connected data source";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden ring-1 ring-slate-200"
            >
                {/* Header */}
                <DialogHeader className="gap-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${target.accent}`}
                        >
                            <Icon className="h-[18px] w-[18px]" />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-slate-900">
                                {target.title}
                                {target.live && (
                                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-100">
                                        Live
                                    </span>
                                )}
                            </DialogTitle>
                            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
                                {target.description}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="space-y-4 px-5 py-4">

                    {/* Summary rows */}
                    <dl className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                        <div className="flex items-center justify-between gap-3 bg-slate-50/70 px-3.5 py-2.5">
                            <dt className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {target.reference}
                                </span>
                                Reference
                            </dt>
                            <dd className="text-[12px] font-medium text-slate-700">
                                {target.title}
                            </dd>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3.5 py-2.5">
                            <dt className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                                <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                                Date range
                            </dt>
                            <dd className="text-[12px] font-medium tabular-nums text-slate-700">
                                {rangeLabel}
                            </dd>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3.5 py-2.5">
                            <dt className="text-[11.5px] font-medium text-slate-500">
                                Records
                            </dt>
                            <dd className="text-[12px] font-medium tabular-nums text-slate-700">
                                {recordsLabel}
                            </dd>
                        </div>
                    </dl>

                    {/* Format selector */}
                    <div>
                        <p className="text-[11px] font-medium text-slate-600">
                            Export format
                        </p>

                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                            {formatOptions.map((option) => {
                                const OptionIcon = option.icon;
                                const active = format === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => onFormatChange(option.value)}
                                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                                            active
                                                ? "bg-white ring-2 ring-amber-300"
                                                : "bg-slate-50 ring-1 ring-slate-200 hover:bg-white hover:ring-slate-300"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2 text-[12px] font-medium text-slate-800">
                                            <OptionIcon className="h-3.5 w-3.5 text-slate-500" />
                                            {option.label}
                                        </span>

                                        <span
                                            className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
                                                active
                                                    ? "bg-amber-800 text-white"
                                                    : "bg-slate-200 text-transparent"
                                            }`}
                                        >
                                            <Check className="h-2.5 w-2.5" />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hint */}
                    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
                        {isLiveReport ? (
                            format === "PDF" ? (
                                <>
                                    <Printer className="mt-px h-3 w-3 shrink-0" />
                                    Opens your browser print dialog — choose “Save as PDF” to
                                    keep a copy.
                                </>
                            ) : (
                                <>
                                    <Download className="mt-px h-3 w-3 shrink-0" />
                                    Downloads an .xlsx workbook with the report data.
                                </>
                            )
                        ) : (
                            <>
                                <TriangleAlert className="mt-px h-3 w-3 shrink-0 text-amber-500" />
                                This report type has no connected data source yet — output
                                will be an empty template.
                            </>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={generating}
                        className="h-9 gap-2 rounded-xl bg-amber-800 px-4 text-[12.5px] font-medium text-white hover:bg-amber-900 disabled:opacity-60"
                    >
                        {generating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        {generating ? "Generating…" : `Generate ${format}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
