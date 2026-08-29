import { useEffect, useState } from "react";
import {
    ScrollText,
    Loader2,
    MapPin,
    Clock,
    Search,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePatrol } from "@/hooks/usePatrol";

type PatrolLogsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type PatrolLogStatus = "Pending" | "Ongoing" | "Completed" | "Missed";

const statusStyles: Record<PatrolLogStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Ongoing: "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Missed: "bg-red-100 text-red-700",
};

function formatDateTime(value: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export default function PatrolLogsModal({
    open,
    onOpenChange,
}: PatrolLogsModalProps) {
    const { allPatrolLogs, isFetchingLogs, getAllPatrolLogs } = usePatrol();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    useEffect(() => {
        if (open) {
            getAllPatrolLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const filteredLogs = allPatrolLogs.filter((log) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            query === "" ||
            log.personnel_name.toLowerCase().includes(query) ||
            log.area_patrolled.toLowerCase().includes(query);

        const matchesStatus = status === "all" || log.status === status;

        return matchesSearch && matchesStatus;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden">
                {/* Header */}
                <div className="border-b border-blue-100 bg-linear-to-br from-blue-50 via-white to-cyan-50 px-6 py-5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-200">
                        <ScrollText className="h-7 w-7 text-white" />
                    </div>

                    <h2 className="mt-3 text-center text-lg font-bold text-slate-900">
                        Patrol Logs
                    </h2>

                    <p className="mt-1 text-center text-xs leading-5 text-slate-500">
                        Review patrol activity recorded by security personnel
                        across all monitoring schedules.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2.5 border-b bg-white px-6 py-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search personnel or area..."
                            className="h-10 rounded-xl pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select
                        value={status}
                        onValueChange={(value) => {
                            if (value) setStatus(value);
                        }}
                    >
                        <SelectTrigger className="h-10 w-full rounded-xl sm:w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Missed">Missed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Body */}
                <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
                    {isFetchingLogs && allPatrolLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            <p className="text-sm text-slate-500">
                                Loading patrol logs...
                            </p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                <ScrollText className="h-8 w-8 text-blue-400" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    {allPatrolLogs.length === 0
                                        ? "No Patrol Logs Yet"
                                        : "No Matching Logs"}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {allPatrolLogs.length === 0
                                        ? "Patrol activity recorded by personnel will appear here."
                                        : "Try adjusting your search or filter."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.patrol_log_id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900">
                                                {log.personnel_name}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {log.area_patrolled}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateTime(log.patrol_start)}
                                                    {" – "}
                                                    {log.patrol_end
                                                        ? formatDateTime(log.patrol_end)
                                                        : "In progress"}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                statusStyles[
                                                    log.status as PatrolLogStatus
                                                ]
                                            }`}
                                        >
                                            {log.status}
                                        </span>
                                    </div>

                                    {log.observations && (
                                        <p className="mt-2.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                            {log.observations}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t bg-slate-50 px-6 py-4">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
