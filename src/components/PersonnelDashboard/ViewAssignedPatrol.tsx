import { useEffect, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    Play,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/hooks/useMonitoring";
import { usePatrol } from "@/hooks/usePatrol";
import { useToast } from "@/hooks/useToast";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import StartPatrolModal from "@/components/AssignArea/StartPatrol";

const statusStyles: Record<MonitoringSchedule["status"], string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Ongoing: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Completed: "border-blue-200 bg-blue-50 text-blue-700",
    Cancelled: "border-red-200 bg-red-50 text-red-700",
};

const statusDotStyles: Record<MonitoringSchedule["status"], string> = {
    Pending: "bg-amber-500",
    Ongoing: "bg-emerald-500",
    Completed: "bg-blue-500",
    Cancelled: "bg-red-500",
};

export default function ViewAssignedPatrol() {
    const { mySchedules, getMyMonitoringSchedules, loading } = useMonitoring();
    const { startPatrol, getMyPatrols, isloading } = usePatrol();
    const { showToast } = useToast();
    const [startOpen, setStartOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);

    useEffect(() => {
        getMyMonitoringSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

 

    const handleStartPatrol = async () => {
        if (!selectedSchedule) return;

        const result = await startPatrol(selectedSchedule.schedule_id);

        if (result.success) {
            showToast("success", "Patrol Started", result.message);
            await Promise.all([getMyMonitoringSchedules(), getMyPatrols()]);
            setStartOpen(false);
            setSelectedSchedule(null);
            return;
        }

        showToast("error", "Unable to Start Patrol", result.message);
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
        <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-linear-to-br from-orange-50 via-white to-slate-50 p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            View Assigned Patrol
                        </div>

                        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                            Patrol Assignments
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Review your assigned areas, schedule window, current status, and start pending patrols from one clean workspace.
                        </p>
                    </div>

                  
                </div>

               
            </div>

            <div className="p-4 sm:p-5">
                {loading && mySchedules.length === 0 ? (
                    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-600" />
                        Loading assigned patrols...
                    </div>
                ) : mySchedules.length === 0 ? (
                    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                            <MapPin className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-950">
                            No assigned patrols yet
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            New patrol assignments from the admin team will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 xl:grid-cols-1">
                        {mySchedules.map((schedule) => (
                            <article
                                key={schedule.schedule_id}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-slate-950">
                                                    {schedule.assigned_area}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Patrol ID #{schedule.schedule_id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                            <InfoPill icon={CalendarDays} text={formatDate(schedule.schedule_date)} />
                                            <InfoPill
                                                icon={Clock3}
                                                text={`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}
                                            />
                                            <InfoPill
                                                icon={UserRound}
                                                text={`Assigned by ${schedule.assigned_by_first_name ?? "Admin"} ${schedule.assigned_by_last_name ?? ""}`}
                                            />
                                        </div>

                                        {schedule.remarks && (
                                            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                                                {schedule.remarks}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                                        <Badge
                                            variant="outline"
                                            className={`h-7 rounded-full px-3 font-semibold ${statusStyles[schedule.status]}`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[schedule.status]}`} />
                                            {schedule.status}
                                        </Badge>

                                        {schedule.status === "Pending" ? (
                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSchedule(schedule);
                                                    setStartOpen(true);
                                                }}
                                                className="rounded-full bg-orange-700 text-white hover:bg-orange-800"
                                            >
                                                <Play className="h-4 w-4" />
                                                Start Patrol
                                            </Button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Updated
                                            </span>
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
        </section>
    );
}


function InfoPill({
    icon: Icon,
    text,
}: {
    icon: typeof CalendarDays;
    text: string;
}) {
    return (
        <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <Icon className="h-3.5 w-3.5 shrink-0 text-orange-600" />
            <span className="truncate">{text}</span>
        </span>
    );
}
