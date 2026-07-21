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
import { Badge } from "@/components/ui/badge";
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



const statusStyles: Record<ScheduleStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    Ongoing: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    Completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
};



export default function MonitoringTable() {
    const { showToast } = useToast();
    const { getMonitoringSchedules, schedules, deleteMonitoringSchedule, loading } = useMonitoring();
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        getMonitoringSchedules();
    }, [getMonitoringSchedules]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
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

        const result = await deleteMonitoringSchedule(
            selectedSchedule.schedule_id
        );

        if (result.success) {
            showToast(
                "success",
                "Schedule Deleted",
                result.message
            );

            await getMonitoringSchedules();

            setDeleteOpen(false);
            setSelectedSchedule(null);
        } else {
            showToast(
                "error",
                "Delete Failed",
                result.message
            );
        }
    };


    if (loading && schedules.length === 0) {
        return <MonitoringTableSkeleton />;
    }

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">

            <Table>

                <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead>Personnel</TableHead>
                        <TableHead>Assigned Area</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duty Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {schedules.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-80 text-center"
                            >
                                <div className="flex flex-col items-center justify-center space-y-4">

                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                        <Shield className="h-8 w-8 text-orange-600" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            No Monitoring Schedules
                                        </h3>

                                        <p className="max-w-2xl text-sm text-slate-500">
                                            There are no monitoring schedules available yet.
                                            Create a new schedule to assign security personnel.
                                        </p>
                                    </div>

                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (schedules.map((row) => (
                        <TableRow
                            key={row.schedule_id}
                            className="transition-colors hover:bg-orange-50/40"
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 ring-1 ring-orange-200/60">
                                        <Shield className="h-5 w-5 text-orange-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {row.first_name} {row.last_name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {row.role}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    {row.assigned_area}
                                </div>
                            </TableCell>

                            <TableCell className="text-slate-700">
                                {formatDate(row.schedule_date)}
                            </TableCell>

                            <TableCell className="text-slate-700">
                                {formatTime(row.start_time)} - {formatTime(row.end_time)}
                            </TableCell>

                            <TableCell>
                                <Badge className={`rounded-full font-medium ${statusStyles[row.status]}`}>
                                    {row.status}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="rounded-lg hover:bg-orange-100"
                                        >
                                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedSchedule(row);
                                            setUpdateModalOpen(true);
                                        }}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedSchedule(row);
                                            setDeleteOpen(true);
                                        }} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )))}
                </TableBody>
                <UpdateMonitoringModal open={updateModalOpen} schedule={selectedSchedule} onClose={() => setUpdateModalOpen(false)} />
                <DeleteMonitoringModal open={deleteOpen} onClose={() => setDeleteOpen(false)} schedule={selectedSchedule} loading={loading} onDelete={handleDelete} />
            </Table>

        </div>
    );
}