import { useEffect, useState } from "react";
import {
    CalendarDays,
    ClipboardCheck,
    Clock3,
    Loader2,
    MapPin,
    Play,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/hooks/useMonitoring";
import { usePatrol } from "@/hooks/usePatrol";
import { useToast } from "@/hooks/useToast";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import StartPatrolModal from "@/components/AssignArea/StartPatrol";
import CompletePatrolModal from "@/components/AssignArea/CompletePatrol";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const statusStyles: Record<MonitoringSchedule["status"], string> = {
    Pending: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    Ongoing: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Completed: "bg-blue-50 text-blue-700 ring-blue-100",
    Cancelled: "bg-slate-50 text-slate-500 ring-slate-200",
};

const statusDotStyles: Record<MonitoringSchedule["status"], string> = {
    Pending: "bg-yellow-500",
    Ongoing: "bg-emerald-500",
    Completed: "bg-blue-500",
    Cancelled: "bg-slate-400",
};

export default function ViewAssignedPatrol() {
    const { mySchedules, getMyMonitoringSchedules, loading } = useMonitoring();
    const { startPatrol, completePatrol, getMyPatrols, isloading } = usePatrol();
    const { showToast } = useToast();
    const [startOpen, setStartOpen] = useState(false);
    const [completeOpen, setCompleteOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);

    useEffect(() => {
        getMyMonitoringSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStartPatrol = async () => {
        if (!selectedSchedule) return;

        const result = await startPatrol(selectedSchedule.schedule_id);

        if (result.success) {
            showToast("success", "Patrol Recorded", result.message);
            await Promise.all([getMyMonitoringSchedules(), getMyPatrols()]);
            setStartOpen(false);
            setSelectedSchedule(null);
            return;
        }

        showToast("error", "Unable to Record Patrol", result.message);
    };

    const handleCompletePatrol = async (observations: string) => {
        if (!selectedSchedule) return;

        const result = await completePatrol(selectedSchedule.schedule_id, observations);

        if (result.success) {
            showToast("success", "Patrol Completed", result.message);
            await Promise.all([getMyMonitoringSchedules(), getMyPatrols()]);
            setCompleteOpen(false);
            setSelectedSchedule(null);
            return;
        }

        showToast("error", "Unable to Complete Patrol", result.message);
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
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
        <section className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <ShieldCheck className="h-4 w-4 text-amber-800" />
                </div>

                <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                        Patrol Assignments
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                        Your assigned areas, schedule window, and current status
                    </p>
                </div>
            </div>

            <div className="p-4">
                {loading && mySchedules.length === 0 ? (
                    <div className="flex min-h-40 items-center justify-center gap-2 rounded-xl bg-slate-50 text-[12.5px] text-slate-500 ring-1 ring-slate-200">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-800" />
                        Loading assigned patrols…
                    </div>
                ) : mySchedules.length === 0 ? (
                    <div className="rounded-xl bg-white/50 px-6 py-14 text-center ring-1 ring-slate-200">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-800 ring-1 ring-amber-100">
                            <MapPin className="h-5 w-5" />
                        </div>

                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                            No assigned patrols yet
                        </p>
                        <p className="mx-auto mt-1 max-w-xs text-[11px] text-slate-400">
                            New assignments from the admin team will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {mySchedules.map((schedule) => (
                            <article
                                key={schedule.schedule_id}
                                className="rounded-xl bg-white/50 p-4 ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                                                <MapPin className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                    {schedule.assigned_area}
                                                </p>
                                                <p className="mt-1 font-mono text-[11px] tracking-tight text-slate-400">
                                                    PTL-{String(schedule.schedule_id).padStart(4, "0")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                                            <span className="inline-flex items-center gap-1 tabular-nums">
                                                <CalendarDays className="h-3 w-3" />
                                                {formatDate(schedule.schedule_date)}
                                            </span>
                                            <span className="text-slate-300">·</span>
                                            <span className="inline-flex items-center gap-1 tabular-nums">
                                                <Clock3 className="h-3 w-3" />
                                                {formatTime(schedule.start_time)}
                                                <span className="text-slate-300">–</span>
                                                {formatTime(schedule.end_time)}
                                            </span>
                                            <span className="text-slate-300">·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <UserRound className="h-3 w-3" />
                                                {schedule.assigned_by_first_name ?? "Admin"}{" "}
                                                {schedule.assigned_by_last_name ?? ""}
                                            </span>
                                        </div>

                                        {schedule.remarks && (
                                            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
                                                {schedule.remarks}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                                        <span className={`${chip} ${statusStyles[schedule.status]}`}>
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[schedule.status]}`}
                                            />
                                            {schedule.status}
                                        </span>

                                        {schedule.status === "Pending" && (
                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSchedule(schedule);
                                                    setStartOpen(true);
                                                }}
                                                className="h-7 gap-1.5 rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-amber-900"
                                            >
                                                <Play className="h-3.5 w-3.5" />
                                                Record patrol
                                            </Button>
                                        )}

                                        {schedule.status === "Ongoing" && (
                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSchedule(schedule);
                                                    setCompleteOpen(true);
                                                }}
                                                className="h-7 gap-1.5 rounded-lg bg-emerald-600 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-700"
                                            >
                                                <ClipboardCheck className="h-3.5 w-3.5" />
                                                Complete patrol
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <StartPatrolModal
                open={startOpen}
                onClose={() => setStartOpen(false)}
                schedule={selectedSchedule}
                loading={isloading}
                onStart={handleStartPatrol}
            />

            <CompletePatrolModal
                open={completeOpen}
                onClose={() => setCompleteOpen(false)}
                schedule={selectedSchedule}
                loading={isloading}
                onComplete={handleCompletePatrol}
            />
        </section>
    );
}