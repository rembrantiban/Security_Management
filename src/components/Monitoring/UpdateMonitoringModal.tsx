import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock3,
    MapPin,
    Shield,
    UserRound,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { MonitoringSchedule } from "@/store/useMonitoringStore"
import { useAuth } from "@/hooks/useAuth";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/useToast";

interface Props {
    open: boolean;
    onClose: () => void;
    schedule: MonitoringSchedule | null;
}



export default function UpdateMonitoringModal({
    open,
    onClose,
    schedule,
}: Props) {

    const [form, setForm] = useState<MonitoringSchedule | null>(schedule);
    const { securityPersonnel, getSecurityPersonnel } = useAuth();
    const { updateMonitoringSchedule, getMonitoringSchedules, loading } = useMonitoring();
    const { showToast } = useToast();


    useEffect(() => {
        getSecurityPersonnel();
        //eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!schedule) return;
        //eslint-disable-next-line
        setForm({
            ...schedule,
            schedule_date: schedule.schedule_date
                ? new Date(schedule.schedule_date)
                    .toISOString()
                    .split("T")[0]
                : "",
            start_time: schedule.start_time?.slice(0, 5),
            end_time: schedule.end_time?.slice(0, 5),
        });
    }, [schedule]);

    if (!open || !form) return null;


    const update = <K extends keyof MonitoringSchedule>(
        key: K,
        value: MonitoringSchedule[K]
    ) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };


   const handleSave = async () => {
    if (!form) return;

    const result = await updateMonitoringSchedule(
        form.schedule_id,
        {
            user_id: form.user_id,
            assigned_area: form.assigned_area,
            schedule_date: form.schedule_date,
            start_time: form.start_time,
            end_time: form.end_time,
            remarks: form.remarks,
        }
    );

    if (result.success) {
        showToast(
            "success",
            "Schedule Updated",
            result.message
        );

        await getMonitoringSchedules();

        onClose();
    } else {
        showToast(
            "error",
            "Update Failed",
            result.message
        );
    }
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

            <div className="w-full max-w-lg overflow-hidden rounded-sm bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">

                    <div className="flex  items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">

                            <Shield className="h-5 w-5 text-orange-700" />

                        </div>

                        <div>

                            <h2 className="text-base font-semibold text-slate-900">

                                Update Monitoring Schedule

                            </h2>

                            <p className="text-xs text-slate-500">

                                {form.first_name} {form.last_name}

                            </p>

                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >

                        <X className="h-4 w-4" />

                    </button>

                </div>

                {/* Body */}

                <div className="space-y-4 px-6 py-5">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">
                            Security Personnel
                        </Label>

                        <div className="relative">

                            <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                            <select
                                value={Number(form.user_id)}
                                onChange={(e) =>
                                    update("user_id", Number(e.target.value))
                                }

                                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-xs outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            >
                                {securityPersonnel.map((person) => (
                                    <option
                                        key={person.user_id}
                                        value={person.user_id}
                                    >
                                        {person.first_name} {person.last_name}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">

                            Assigned Area

                        </Label>

                        <div className="relative">

                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                value={form.assigned_area}
                                onChange={(e) => update("assigned_area", e.target.value)}
                                placeholder="e.g. Main Gate"
                                className="pl-9 rounded-md"
                            />

                        </div>

                    </div>


                    <div className="space-y-1.5">

                        <Label className="text-xs font-medium text-slate-600">

                            Schedule Date

                        </Label>

                        <div className="relative">

                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                type="date"
                                value={form.schedule_date}
                                onChange={(e) => update("schedule_date", e.target.value)}
                                className="pl-9 rounded-md"
                            />

                        </div>

                    </div>


                    <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-1.5">

                            <Label className="text-xs font-medium text-slate-600">

                                Start Time

                            </Label>

                            <div className="relative">

                                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    type="time"
                                    value={form.start_time}
                                    onChange={(e) => update("start_time", e.target.value)}
                                    className="pl-9 rounded-md"
                                />

                            </div>

                        </div>

                        <div className="space-y-1.5">

                            <Label className="text-xs font-medium text-slate-600">

                                End Time

                            </Label>

                            <div className="relative">

                                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    type="time"
                                    value={form.end_time}
                                    onChange={(e) => update("end_time", e.target.value)}
                                    className="pl-9 rounded-md"
                                />

                            </div>

                        </div>

                    </div>

                    <div className="space-y-1.5">

                        <Label className="text-xs font-medium text-slate-600">

                            Remarks

                        </Label>

                        <Textarea
                            value={form.remarks ?? ""}
                            onChange={(e) => update("remarks", e.target.value)}
                            placeholder="Add any notes for this duty..."
                            className="min-h-20 resize-none"
                        />

                    </div>

                </div>

                {/* Footer */}

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">

                    <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={onClose}
                    >

                        Cancel

                    </Button>

                    <Button
                        className="rounded-lg bg-orange-700 hover:bg-orange-800"
                        onClick={handleSave}
                    >

                      {loading ? "Saving..." : "Save Changes"}

                    </Button>

                </div>

            </div>

        </div>
    );
}