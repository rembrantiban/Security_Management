import { useEffect, useState } from "react";
import {
    CalendarDays,
    ClipboardCheck,
    Clock3,
    Eye,
    Loader2,
    MapPin,
    Play,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StartPatrolModal from "@/components/AssignArea/StartPatrol";
import CompletePatrolModal from "@/components/AssignArea/CompletePatrol";
import { useMonitoring } from "@/hooks/useMonitoring";
import { usePatrolActions } from "@/hooks/usePatrolActions";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import PatrolDetailsModal, {
    ScheduleStatusBadge,
} from "@/components/PersonnelDashboard/PatrolDetailsModal";
import {
    formatScheduleCode,
    formatTimeOfDay,
    getScheduleEnd,
} from "@/lib/patrolSchedule";
import { useNow } from "@/hooks/useNow";

export default function ViewAssignedPatrol() {
    const { mySchedules, getMyMonitoringSchedules, loading } = useMonitoring();
    const {
        startOpen,
        completeOpen,
        selectedSchedule,
        isloading,
        openStart,
        openComplete,
        closeStart,
        closeComplete,
        handleStartPatrol,
        handleCompletePatrol,
    } = usePatrolActions();

    const [detailsSchedule, setDetailsSchedule] = useState<MonitoringSchedule | null>(null);
    const now = useNow(30_000, mySchedules.some((s) => s.status === "Ongoing"));

    // Patrols may only be completed once their scheduled end time is reached.
    const canComplete = (schedule: MonitoringSchedule) =>
        now >= getScheduleEnd(schedule.schedule_date, schedule.start_time, schedule.end_time);

    useEffect(() => {
        getMyMonitoringSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white ring-0">

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
                                                    {formatScheduleCode(schedule.schedule_id)}
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
                                                {formatTimeOfDay(schedule.start_time)}
                                                <span className="text-slate-300">–</span>
                                                {formatTimeOfDay(schedule.end_time)}
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
                                        <ScheduleStatusBadge status={schedule.status} />

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDetailsSchedule(schedule)}
                                            className="h-8 gap-1.5 rounded-lg px-3 text-[12px]"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View details
                                        </Button>

                                        {schedule.status === "Pending" && (
                                            <Button
                                                size="sm"
                                                onClick={() => openStart(schedule)}
                                                className="h-8 gap-1.5 rounded-lg bg-orange-700 px-3 text-[12px] hover:bg-orange-800"
                                            >
                                                <Play className="h-3.5 w-3.5" />
                                                Record Patrol
                                            </Button>
                                        )}

                                        {schedule.status === "Ongoing" && (
                                            <Button
                                                size="sm"
                                                onClick={() => openComplete(schedule)}
                                                disabled={!canComplete(schedule)}
                                                title={
                                                    canComplete(schedule)
                                                        ? undefined
                                                        : "A patrol can only be completed once its scheduled end time is reached."
                                                }
                                                className="h-8 gap-1.5 rounded-lg bg-emerald-700 px-3 text-[12px] hover:bg-emerald-800"
                                            >
                                                <ClipboardCheck className="h-3.5 w-3.5" />
                                                {canComplete(schedule)
                                                    ? "Complete Patrol"
                                                    : `Complete at ${formatTimeOfDay(schedule.end_time)}`}
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <PatrolDetailsModal
                open={detailsSchedule !== null}
                onOpenChange={(open) => {
                    if (!open) setDetailsSchedule(null);
                }}
                schedule={
                    mySchedules.find((s) => s.schedule_id === detailsSchedule?.schedule_id) ??
                    detailsSchedule
                }
                onRecord={openStart}
                onComplete={openComplete}
            />

            <StartPatrolModal
                open={startOpen}
                onClose={closeStart}
                schedule={selectedSchedule}
                loading={isloading}
                onStart={handleStartPatrol}
            />

            <CompletePatrolModal
                open={completeOpen}
                onClose={closeComplete}
                schedule={selectedSchedule}
                loading={isloading}
                onComplete={handleCompletePatrol}
            />
        </section>
    );
}