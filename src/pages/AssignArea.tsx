import {
    CalendarDays,
    Clock3,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Play,
    MapPinned,
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useEffect, useState } from "react";
import AssignAreaSkeleton from "@/components/AssignArea/AssignAreSkeleton";
import type { MonitoringSchedule } from "@/store/useMonitoringStore"
import StartPatrolModal from "@/components/AssignArea/StartPatrol";
import { usePatrol } from "@/hooks/usePatrol"
import { useToast } from "@/hooks/useToast"

const badgeColor = (status: string) => {
    switch (status) {
        case "Ongoing":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Completed":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Pending":
            return "bg-amber-50 text-amber-700 border-amber-200";
        default:
            return "bg-red-50 text-red-700 border-red-200";
    }
};

const dotColor = (status: string) => {
    switch (status) {
        case "Ongoing":
            return "bg-emerald-500";
        case "Pending":
            return "bg-amber-500";
        case "Completed":
            return "bg-blue-500";
        default:
            return "bg-red-500";
    }
};

export default function AssignArea() {
    const { getMyMonitoringSchedules, mySchedules, loading } = useMonitoring();
    const [startOpen, setStartOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);
    const { startPatrol, getMyPatrols, isloading } = usePatrol();
    const { showToast } = useToast();


    const handleStartPatrol = async () => {
        if (!selectedSchedule) return;

        const result = await startPatrol(
            selectedSchedule.schedule_id
        );

        if (result.success) {

            showToast(
                "success",
                "Patrol Started",
                result.message
            );

            await Promise.all([
                getMyMonitoringSchedules(),
                getMyPatrols(),
            ]);

            setStartOpen(false);
            setSelectedSchedule(null);

        } else {

            showToast(
                "error",
                "Unable to Start Patrol",
                result.message
            );

        }
    };
    useEffect(() => {
        getMyMonitoringSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

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

    return (
        <div className="space-y-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
                        <ShieldCheck className="h-3 w-3" />
                        Security Personnel
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        Assigned Areas
                    </h1>

                    <p className="mt-0.5 text-sm text-slate-500">
                        Today's monitoring locations and patrol schedules.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => getMyMonitoringSchedules()}
                    disabled={loading}
                >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Cards */}
            {loading && mySchedules.length === 0 ? (
                <AssignAreaSkeleton />
            ) : mySchedules.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
                    <MapPinned size={54} className="text-orange-300"/>
                    <p className="text-sm text-slate-500">No assigned areas for today.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {mySchedules.map((item) => (
                        <Card
                            key={item.schedule_id}
                            className="overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                        >
                            <CardContent className="p-4">
                                {/* Top row: area + status on the left, assigned-by on the right */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                            <MapPin className="h-4 w-4 text-orange-700" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate text-base font-semibold text-slate-900">
                                                    {item.assigned_area}
                                                </h2>

                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full px-2 py-0 text-[11px] font-medium ${badgeColor(item.status)}`}
                                                >
                                                    <span className={`mr-1 h-1.5 w-1.5 rounded-full ${dotColor(item.status)}`} />
                                                    {item.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {formatDate(item.schedule_date)}
                                                </span>

                                                <span className="inline-flex items-center gap-1">
                                                    <Clock3 className="h-3 w-3" />
                                                    {formatTime(item.start_time)} ● {formatTime(item.end_time)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                                        <div className="text-right">
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Assigned by
                                            </p>
                                            <p className="text-xs font-medium text-slate-700">
                                                {item.assigned_by_first_name} {item.assigned_by_last_name}
                                            </p>
                                        </div>

                                        <Avatar className="h-8 w-8 border border-orange-200">
                                            <AvatarFallback className="bg-orange-700 text-[11px] font-semibold text-orange-50">
                                                {item.assigned_by_first_name?.charAt(0)}
                                                {item.assigned_by_last_name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                {/* Remarks */}
                                <p className="mt-2.5 pl-11 text-xs leading-5 text-slate-600">
                                    {item.remarks}
                                </p>

                                {/* Footer: assigned-by (mobile only) + actions */}
                                <div className="mt-3 flex items-center justify-between gap-3 pl-11 sm:pl-11">
                                    <div className="flex items-center gap-2 sm:hidden">
                                        <Avatar className="h-6 w-6 border border-orange-200">
                                            <AvatarFallback className="bg-orange-700 text-[10px] font-semibold text-orange-50">
                                                {item.assigned_by_first_name?.charAt(0)}
                                                {item.assigned_by_last_name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] text-slate-500">
                                            Assigned by {item.assigned_by_first_name} {item.assigned_by_last_name}
                                        </span>
                                    </div>

                                    <div className="ml-auto flex items-center gap-2">


                                        {item.status === "Pending" && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSchedule(item);
                                                    setStartOpen(true);
                                                }}
                                                className="group rounded-lg bg-orange-700 hover:bg-orange-800"
                                            >
                                                <span className="mr-2 h-2 w-2 rounded-full bg-green-400 animate-pulse" />

                                                <Play className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />

                                                Start Patrol
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <StartPatrolModal
                open={startOpen}
                onClose={() => setStartOpen(false)}
                schedule={selectedSchedule}
                loading={isloading}
                onStart={handleStartPatrol}
            />
        </div>
    );
}