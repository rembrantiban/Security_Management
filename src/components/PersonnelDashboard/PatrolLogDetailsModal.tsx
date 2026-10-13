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
import type { PatrolLog } from "@/store/usePatrolStore";
import {
    DetailItem,
    Section,
} from "@/components/PersonnelDashboard/PatrolDetailsModal";
import {
    actualDuration,
    formatDateTime,
    formatScheduleCode,
    formatScheduleDate,
    formatTimeOfDay,
    scheduledDuration,
} from "@/lib/patrolSchedule";

const logStatusStyles: Record<PatrolLog["status"], string> = {
    Pending: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    Ongoing: "bg-blue-50 text-blue-700 ring-blue-100",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Missed: "bg-red-50 text-red-700 ring-red-100",
};

type PatrolLogDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    log: PatrolLog | null;
};

export default function PatrolLogDetailsModal({
    open,
    onOpenChange,
    log,
}: PatrolLogDetailsModalProps) {
    if (!log) return null;

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
                            {log.area_patrolled}
                        </DialogTitle>
                        <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-mono tracking-tight text-slate-500">
                                {formatScheduleCode(log.schedule_id)}
                            </span>
                            <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${logStatusStyles[log.status]}`}
                            >
                                {log.status}
                            </span>
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4">

                    <Section title="Patrol activity">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <DetailItem
                                icon={Play}
                                label="Started"
                                value={formatDateTime(log.patrol_start)}
                            />
                            <DetailItem
                                icon={ClipboardCheck}
                                label="Ended"
                                value={log.patrol_end ? formatDateTime(log.patrol_end) : "In progress"}
                            />
                            <DetailItem
                                icon={Radar}
                                label="Time on patrol"
                                value={actualDuration(log.patrol_start, log.patrol_end)}
                            />
                        </div>
                    </Section>

                    <Section title="Observations">
                        {log.observations?.trim() ? (
                            <div className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                                <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-700">
                                    {log.observations}
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-xl px-3 py-2.5 text-[12px] text-slate-500 ring-1 ring-slate-200">
                                No observations were recorded for this patrol.
                            </p>
                        )}
                    </Section>

                    <Section title="Scheduled assignment">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <DetailItem
                                icon={CalendarDays}
                                label="Date"
                                value={formatScheduleDate(log.schedule_date)}
                            />
                            <DetailItem
                                icon={Clock3}
                                label="Time window"
                                value={`${formatTimeOfDay(log.start_time)} – ${formatTimeOfDay(log.end_time)}`}
                            />
                            <DetailItem
                                icon={Hourglass}
                                label="Duration"
                                value={scheduledDuration(log.start_time, log.end_time)}
                            />
                            <DetailItem
                                icon={ShieldCheck}
                                label="Patrolled by"
                                value={log.personnel_name}
                            />
                            <DetailItem
                                icon={UserRound}
                                label="Assigned by"
                                value={log.assigned_by_name?.trim() || "Administrator"}
                            />
                            <DetailItem
                                icon={CalendarDays}
                                label="Logged on"
                                value={formatDateTime(log.created_at)}
                            />
                        </div>
                    </Section>

                    {log.remarks?.trim() && (
                        <Section title="Instructions / Remarks">
                            <div className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-700">
                                    {log.remarks}
                                </p>
                            </div>
                        </Section>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-xl text-[12.5px]"
                    >
                        Close
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
