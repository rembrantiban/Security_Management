import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Loader2,
    MapPin,
    ScrollText,
    Search,
    SearchX,
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
import { Input } from "@/components/ui/input";
import { usePatrol } from "@/hooks/usePatrol";

type PatrolLogsPanelProps = {
    onBack: () => void;
};

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

function formatDateTime(value: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function timeAgo(value: string | null) {
    if (!value) return "—";

    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60_000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;

    return `${Math.floor(hours / 24)}d ago`;
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function PatrolLogsPanel({ onBack }: PatrolLogsPanelProps) {
    const { allPatrolLogs, isFetchingLogs, getAllPatrolLogs } = usePatrol();
    const [search, setSearch] = useState("");

    useEffect(() => {
        getAllPatrolLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // This panel is scoped to patrols that are currently in progress.
    const ongoingLogs = useMemo(
        () => allPatrolLogs.filter((log) => log.status === "Ongoing"),
        [allPatrolLogs]
    );

    const hasFilters = search.trim() !== "";

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return ongoingLogs
            .filter((log) => {
                return (
                    query === "" ||
                    log.personnel_name.toLowerCase().includes(query) ||
                    log.area_patrolled.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => {
                const at = new Date(a.patrol_start ?? a.created_at).getTime();
                const bt = new Date(b.patrol_start ?? b.created_at).getTime();
                return bt - at;
            });
    }, [ongoingLogs, search]);

    const clearFilters = () => setSearch("");

    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Panel header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Back to schedules"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                        <ScrollText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-slate-900">
                            Ongoing Patrols
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                        </h2>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                            Patrols currently in progress across all monitoring schedules.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 self-start rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-amber-800 ring-1 ring-amber-100 sm:self-auto">
                    {filteredLogs.length} active
                </span>
            </div>

            {/* Toolbar */}
            <div className="border-b border-slate-100 px-5 py-3.5">
                <div className="relative w-full lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search personnel or area"
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
            {isFetchingLogs && allPatrolLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <p className="text-[12px] text-slate-500">Loading patrol logs…</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                        {ongoingLogs.length === 0 ? (
                            <ScrollText className="h-5 w-5 text-slate-400" />
                        ) : (
                            <SearchX className="h-5 w-5 text-slate-400" />
                        )}
                    </div>

                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                        {ongoingLogs.length === 0
                            ? "No ongoing patrols"
                            : "No ongoing patrols match your search"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                        {ongoingLogs.length === 0
                            ? "Patrols currently in progress will appear here."
                            : "Try a different personnel name or area."}
                    </p>

                    {hasFilters && ongoingLogs.length > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-2 text-[11px] font-medium text-amber-800 hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                <TableHead className={`${headCell} px-5`}>Personnel</TableHead>
                                <TableHead className={headCell}>Assigned Area</TableHead>
                                <TableHead className={headCell}>Started</TableHead>
                                <TableHead className={headCell}>Observations</TableHead>
                                <TableHead className={`${headCell} px-5`}>Progress</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow
                                    key={log.patrol_log_id}
                                    className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    {/* Personnel */}
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                                {initials(log.personnel_name) || "—"}
                                            </div>

                                            <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                {log.personnel_name}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Assigned Area */}
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                            {log.area_patrolled}
                                        </div>
                                    </TableCell>

                                    {/* Started */}
                                    <TableCell className="py-3">
                                        <div className="leading-tight">
                                            <p className="text-[12.5px] font-medium text-slate-700">
                                                {timeAgo(log.patrol_start)}
                                            </p>
                                            <p className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                                                {formatDateTime(log.patrol_start)}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Observations */}
                                    <TableCell className="py-3">
                                        <p
                                            className="max-w-[240px] truncate text-[12.5px] text-slate-500"
                                            title={log.observations ?? undefined}
                                        >
                                            {log.observations || "—"}
                                        </p>
                                    </TableCell>

                                    {/* Progress */}
                                    <TableCell className="px-5 py-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800 ring-1 ring-amber-100 whitespace-nowrap">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            </span>
                                            In progress
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
