import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    Loader2,
    ScrollText,
    Search,
    SearchX,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReportGenerationStore } from "@/store/useReportGenerationStore";

type AllReportsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

function formatWhen(value: string) {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function AllReportsModal({
    open,
    onOpenChange,
}: AllReportsModalProps) {
    const { history, isFetching, getReportGenerations } =
        useReportGenerationStore();
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) getReportGenerations(200);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return history;

        return history.filter(
            (row) =>
                row.title.toLowerCase().includes(query) ||
                (row.generated_by_name ?? "").toLowerCase().includes(query) ||
                row.report_ref.toLowerCase().includes(query)
        );
    }, [history, search]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-4xl rounded-2xl p-0 gap-0 overflow-hidden ring-1 ring-slate-200"
            >
                {/* Header */}
                <DialogHeader className="gap-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                            <ScrollText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-[14px] font-semibold tracking-tight text-slate-900">
                                All Generated Reports
                            </DialogTitle>
                            <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                                Every report produced from the Reports Center, newest first.
                            </p>
                        </div>

                        <span className="ml-auto shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">
                            {filtered.length}
                        </span>
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="border-b border-slate-100 px-5 py-3.5">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search report, ref, or user"
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
                </div>

                {/* Body */}
                <div className="max-h-[55vh] overflow-y-auto">
                    {isFetching && history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            <p className="text-[12px] text-slate-500">
                                Loading reports…
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                {history.length === 0 ? (
                                    <ScrollText className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <SearchX className="h-5 w-5 text-slate-400" />
                                )}
                            </div>
                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                {history.length === 0
                                    ? "Nothing generated yet"
                                    : "No reports match your search"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                {history.length === 0
                                    ? "Reports you generate appear here."
                                    : "Try a different report name or user."}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead className={`${headCell} px-5`}>
                                        Report
                                    </TableHead>
                                    <TableHead className={headCell}>Format</TableHead>
                                    <TableHead className={headCell}>Records</TableHead>
                                    <TableHead className={headCell}>Generated By</TableHead>
                                    <TableHead className={`${headCell} px-5`}>
                                        Generated At
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.map((row) => (
                                    <TableRow
                                        key={row.report_generation_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                                                    {row.export_format === "PDF" ? (
                                                        <FileText className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <FileSpreadsheet className="h-3.5 w-3.5" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[12.5px] font-medium leading-none text-slate-900">
                                                        {row.title}
                                                    </p>
                                                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                        {row.report_ref}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span className="inline-flex rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                                                {row.export_format}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span className="text-[12px] tabular-nums text-slate-600">
                                                {row.record_count ?? "—"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span className="truncate text-[12px] text-slate-600">
                                                {row.generated_by_name ?? "System"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-5 py-3">
                                            <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-500">
                                                {formatWhen(row.created_at)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
