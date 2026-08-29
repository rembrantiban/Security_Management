import {
    MapPin,
    MoreHorizontal,
    Pencil,
    Shield,
    Trash2,
} from "lucide-react";

import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useEffect, useState } from "react";
import UpdateMonitoringModal from "./UpdateMonitoringModal";
import DeleteMonitoringModal from "./DeleteMonitoringModal";
import { useToast } from "@/hooks/useToast";
import MonitoringTableSkeleton from "./MonitoringSkeletonTable";

type ScheduleStatus = "Pending" | "Ongoing" | "Completed" | "Cancelled";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const statusStyles: Record<ScheduleStatus, { className: string; dot: string }> = {
    Pending: { className: "bg-yellow-50 text-yellow-700 ring-yellow-100", dot: "bg-yellow-500" },
    Ongoing: { className: "bg-amber-50 text-amber-800 ring-amber-100", dot: "bg-amber-500" },
    Completed: { className: "bg-emerald-50 text-emerald-700 ring-emerald-100", dot: "bg-emerald-500" },
    Cancelled: { className: "bg-slate-50 text-slate-500 ring-slate-200", dot: "bg-slate-400" },
};

export default function MonitoringTable() {
    const { showToast } = useToast();
    const { getMonitoringSchedules, schedules, deleteMonitoringSchedule, loading } =
        useMonitoring();
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        getMonitoringSchedules();
    }, [getMonitoringSchedules]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;

        const result = await deleteMonitoringSchedule(selectedSchedule.schedule_id);

        if (result.success) {
            showToast("success", "Schedule Deleted", result.message);

            await getMonitoringSchedules();

            setDeleteOpen(false);
            setSelectedSchedule(null);
        } else {
            showToast("error", "Delete Failed", result.message);
        }
    };

    if (loading && schedules.length === 0) {
        return <MonitoringTableSkeleton />;
    }

    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className={`${headCell} px-5`}>Personnel</TableHead>
                            <TableHead className={headCell}>Assigned Area</TableHead>
                            <TableHead className={headCell}>Date</TableHead>
                            <TableHead className={headCell}>Duty Schedule</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {schedules.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="py-16 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                        <Shield className="h-5 w-5 text-amber-800" />
                                    </div>

                                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                                        No monitoring schedules
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Assign a schedule to put personnel on patrol.
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules.map((row) => {
                                const status = statusStyles[row.status];

                                return (
                                    <TableRow
                                        key={row.schedule_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        {/* Personnel */}
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                                    {row.first_name?.[0]}
                                                    {row.last_name?.[0]}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {row.first_name} {row.last_name}
                                                    </p>
                                                    <p className="mt-1 truncate text-[11px] text-slate-400">
                                                        {row.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Assigned Area */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                {row.assigned_area}
                                            </div>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="py-3">
                                            <span className="whitespace-nowrap text-[12.5px] tabular-nums text-slate-600">
                                                {formatDate(row.schedule_date)}
                                            </span>
                                        </TableCell>

                                        {/* Duty Schedule */}
                                        <TableCell className="py-3">
                                            <span className="whitespace-nowrap text-[12.5px] tabular-nums text-slate-600">
                                                {formatTime(row.start_time)}
                                                <span className="mx-1 text-slate-300">–</span>
                                                {formatTime(row.end_time)}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="py-3">
                                            <span className={`${chip} ${status.className}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                {row.status}
                                            </span>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-5 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-44 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-slate-200"
                                                >
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        onClick={() => {
                                                            setSelectedSchedule(row);
                                                            setUpdateModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit schedule
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-slate-100" />

                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-red-600 focus:bg-red-50 focus:text-red-700"
                                                        onClick={() => {
                                                            setSelectedSchedule(row);
                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete schedule
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <UpdateMonitoringModal
                open={updateModalOpen}
                schedule={selectedSchedule}
                onClose={() => setUpdateModalOpen(false)}
            />
            <DeleteMonitoringModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                schedule={selectedSchedule}
                loading={loading}
                onDelete={handleDelete}
            />
        </div>
    );
}