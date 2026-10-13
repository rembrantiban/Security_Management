import { useEffect, useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
    CalendarDays,
    ClipboardCheck,
    Clock3,
    FileText,
    Hourglass,
    MapPin,
    NotebookPen,
    Play,
    Radar,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePatrol } from "@/hooks/usePatrol";
import { useNow } from "@/hooks/useNow";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import {
    actualDuration,
    formatDateTime,
    formatScheduleCode,
    formatScheduleDate,
    formatTimeOfDay,
    getScheduleEnd,
    scheduledDuration,
} from "@/lib/patrolSchedule";

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

export function ScheduleStatusBadge({
    status,
}: {
    status: MonitoringSchedule["status"];
}) {
    return (
        <span className={`${chip} ${statusStyles[status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status]}`} />
            {status}
        </span>
    );
}


function fullName(...parts: (string | null | undefined)[]) {
    return parts.filter((p) => p && p.trim() !== "").join(" ");
}

type DetailItemProps = {
    icon: LucideIcon;
    label: string;
    value: string;
};

export function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
    return (
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-200">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                    {label}
                </p>
                <p className="mt-0.5 wrap-break-word text-[12.5px] font-medium tabular-nums text-slate-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-700">
                {title}
            </p>
            {children}
        </section>
    );
}

type PatrolDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: MonitoringSchedule | null;
    onRecord: (schedule: MonitoringSchedule) => void;
    onComplete: (schedule: MonitoringSchedule) => void;
};

export default function PatrolDetailsModal({
    open,
    onOpenChange,
    schedule,
    onRecord,
    onComplete,
}: PatrolDetailsModalProps) {
    const { patrols, getMyPatrols } = usePatrol();
    const now = useNow(30_000, open && schedule?.status === "Ongoing");

    useEffect(() => {
        if (open && schedule && schedule.status !== "Pending") {
            getMyPatrols().catch((error) => console.error(error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, schedule?.schedule_id, schedule?.status]);

    const patrolLog = useMemo(
        () =>
            schedule
                ? patrols.find((log) => log.schedule_id === schedule.schedule_id) ?? null
                : null,
        [patrols, schedule]
    );

    if (!schedule) return null;

    const assignedBy =
        fullName(
            schedule.assigned_by_first_name,
            schedule.assigned_by_middle_name,
            schedule.assigned_by_last_name
        ) || "Administrator";

    const assignedTo =
        fullName(schedule.first_name, schedule.middle_name, schedule.last_name) ||
        schedule.username;

    const scheduleEnd = getScheduleEnd(
        schedule.schedule_date,
        schedule.start_time,
        schedule.end_time
    );
    const canComplete = now >= scheduleEnd;

    const handleAction = (action: (s: MonitoringSchedule) => void) => {
        onOpenChange(false);
        action(schedule);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl">

                {/* Header */}
                <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 pr-12">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                        <MapPin className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <DialogTitle className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                            {schedule.assigned_area}
                        </DialogTitle>
                        <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-mono tracking-tight text-slate-500">
                                {formatScheduleCode(schedule.schedule_id)}
                            </span>
                            <ScheduleStatusBadge status={schedule.status} />
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4">

                    <Section title="Schedule">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <DetailItem
                                icon={CalendarDays}
                                label="Date"
                                value={formatScheduleDate(schedule.schedule_date)}
                            />
                            <DetailItem
                                icon={Clock3}
                                label="Time window"
                                value={`${formatTimeOfDay(schedule.start_time)} – ${formatTimeOfDay(schedule.end_time)}`}
                            />
                            <DetailItem
                                icon={Hourglass}
                                label="Duration"
                                value={scheduledDuration(schedule.start_time, schedule.end_time)}
                            />
                        </div>
                    </Section>

                    <Section title="Assignment">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DetailItem icon={ShieldCheck} label="Assigned to" value={assignedTo} />
                            <DetailItem icon={UserRound} label="Assigned by" value={assignedBy} />
                            <DetailItem
                                icon={CalendarDays}
                                label="Assigned on"
                                value={formatDateTime(schedule.created_at)}
                            />
                            <DetailItem
                                icon={Clock3}
                                label="Last updated"
                                value={formatDateTime(schedule.updated_at)}
                            />
                        </div>
                    </Section>

                    <Section title="Instructions / Remarks">
                        {schedule.remarks?.trim() ? (
                            <div className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-700">
                                    {schedule.remarks}
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-xl px-3 py-2.5 text-[12px] text-slate-500 ring-1 ring-slate-200">
                                No remarks were provided for this assignment.
                            </p>
                        )}
                    </Section>

                    <Section title="Patrol activity">
                        {schedule.status === "Pending" ? (
                            <p className="rounded-xl px-3 py-2.5 text-[12px] text-slate-500 ring-1 ring-slate-200">
                                This patrol has not been started yet. Use{" "}
                                <span className="font-medium text-slate-700">Record Patrol</span>{" "}
                                when you begin your duty.
                            </p>
                        ) : !patrolLog ? (
                            <p className="rounded-xl px-3 py-2.5 text-[12px] text-slate-500 ring-1 ring-slate-200">
                                No patrol log was recorded for this assignment.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <DetailItem
                                        icon={Play}
                                        label="Started"
                                        value={formatDateTime(patrolLog.patrol_start)}
                                    />
                                    <DetailItem
                                        icon={ClipboardCheck}
                                        label="Ended"
                                        value={
                                            patrolLog.patrol_end
                                                ? formatDateTime(patrolLog.patrol_end)
                                                : "In progress"
                                        }
                                    />
                                    <DetailItem
                                        icon={Radar}
                                        label="Time on patrol"
                                        value={actualDuration(patrolLog.patrol_start, patrolLog.patrol_end)}
                                    />
                                </div>

                                {patrolLog.observations?.trim() && (
                                    <div className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                                        <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                                                Observations
                                            </p>
                                            <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-700">
                                                {patrolLog.observations}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                </div>

                {/* Footer */}
                <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-xl text-[12.5px]"
                    >
                        Close
                    </Button>

                    {schedule.status === "Pending" && (
                        <Button
                            onClick={() => handleAction(onRecord)}
                            className="h-9 gap-1.5 rounded-xl bg-orange-700 text-[12.5px] hover:bg-orange-800"
                        >
                            <Play className="h-3.5 w-3.5" />
                            Record Patrol
                        </Button>
                    )}

                    {schedule.status === "Ongoing" && (
                        <Button
                            onClick={() => handleAction(onComplete)}
                            disabled={!canComplete}
                            title={
                                canComplete
                                    ? undefined
                                    : "A patrol can only be completed once its scheduled end time is reached."
                            }
                            className="h-9 gap-1.5 rounded-xl bg-emerald-700 text-[12.5px] hover:bg-emerald-800"
                        >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            {canComplete
                                ? "Complete Patrol"
                                : `Complete at ${formatTimeOfDay(schedule.end_time)}`}
                        </Button>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
