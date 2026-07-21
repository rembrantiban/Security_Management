
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    MapPin,
    Clock,
    CalendarDays,
    Timer,
    CheckCircle2,
    X,
    Eye,
    Printer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatrol } from "@/hooks/usePatrol"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PatrolLog } from "@/store/usePatrolStore";





function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatDuration(start: string, end: string) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (Number.isNaN(ms) || ms < 0) return "—";

    const totalMinutes = Math.round(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

export default function MyPatrolReportsPage() {

    const { completedPatrols, isloading, getMyCompletedPatrols } = usePatrol();
    const patrols = completedPatrols;
    const total = patrols.length;

    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<PatrolLog | null>(null);

    useEffect(() => {
        getMyCompletedPatrols()
        //eslint-disable-next-line
    }, [])

    const filtered = useMemo(() => {
        if (search.trim() === "") return patrols;
        const q = search.toLowerCase();
        return patrols.filter((p) => p.area_patrolled.toLowerCase().includes(q));
    }, [patrols, search]);



    return (
        <div className="space-y-2">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    My Patrol Reports
                </h1>
                <p className="text-sm text-slate-500">
                    Completed patrol logs assigned to you.
                </p>
            </div>


            {/* Toolbar */}
            <Card className="rounded border border-slate-200 bg-white shadow-sm p-0">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

                    {/* Search */}
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <Input
                            placeholder="Search patrol area..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-11 shadow-none transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                            <p className="text-xs font-medium text-slate-500">
                                Completed Patrols
                            </p>

                            <p className="mt-0.5 text-xl font-bold text-emerald-700">
                                {total}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                            <MapPin className="h-5 w-5 text-orange-700" />
                        </div>

                    </div>

                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden rounded border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/60">
                                <TableHead>Area Patrolled</TableHead>
                                <TableHead className="hidden sm:table-cell">Schedule</TableHead>
                                <TableHead className="hidden md:table-cell">Actual Patrol</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isloading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="py-3">
                                            <Skeleton className="h-8 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))}


                            {!isloading && filtered.map((p) => (
                                <TableRow key={p.patrol_log_id} className="hover:bg-slate-50/60">
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                                <MapPin className="h-4 w-4 text-orange-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {p.area_patrolled}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {formatDate(p.schedule_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden text-sm text-slate-600 sm:table-cell">
                                        {p.start_time} – {p.end_time}
                                    </TableCell>
                                    <TableCell className="hidden text-sm text-slate-600 md:table-cell">
                                        {p.patrol_start && p.patrol_end
                                            ? formatDuration(
                                                p.patrol_start,
                                                p.patrol_end
                                            )
                                            : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                            {p.patrol_start && p.patrol_end
                                                ? formatDuration(
                                                    p.patrol_start,
                                                    p.patrol_end
                                                )
                                                : "—"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 rounded-lg"
                                            onClick={() => setSelected(p)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!isloading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                                        No completed patrol reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Detail modal — plain overlay, no Radix Dialog */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Patrol Report
                            </h2>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                                onClick={() => setSelected(null)}
                            >
                                <X className="h-4.5 w-4.5" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4">

                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                                    <MapPin className="h-5 w-5 text-orange-700" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">
                                        {selected.area_patrolled}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {formatDate(selected.schedule_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {selected.status}
                                </Badge>
                            </div>

                            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-slate-400" />
                                        Scheduled Window
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {selected.start_time} – {selected.end_time}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        Actual Patrol
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {selected.patrol_start
                                            ? formatTime(selected.patrol_start)
                                            : "—"}{" "}
                                        –{" "}
                                        {selected.patrol_end
                                            ? formatTime(selected.patrol_end)
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-slate-400" />
                                        Duration
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {selected.patrol_start &&
                                            selected.patrol_end
                                            ? formatDuration(
                                                selected.patrol_start,
                                                selected.patrol_end
                                            )
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-slate-400">
                                Logged {formatDate(selected.created_at)}
                            </p>

                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-slate-100 p-4">
                            <Button
                                variant="outline"
                                className="w-full gap-1.5 rounded-xl"
                                onClick={() => window.print()}
                            >
                                <Printer className="h-4 w-4" />
                                Print Report
                            </Button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}