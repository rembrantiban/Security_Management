import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    Hourglass,
    Loader2,
    MapPin,
    PencilLine,
    Save,
    StickyNote,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FormSection,
    PersonInitials,
    scheduleInputClass,
    scheduleTextareaClass,
} from "@/components/Monitoring/ScheduleFormFields";
import {
    ScheduleStatusBadge,
} from "@/components/PersonnelDashboard/PatrolDetailsModal";
import {
    formatScheduleCode,
    scheduledDuration,
} from "@/lib/patrolSchedule";

import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import { useAuth } from "@/hooks/useAuth";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/useToast";
import { getTodayLocal, toLocalDateString } from "@/lib/date";

interface Props {
    open: boolean;
    onClose: () => void;
    schedule: MonitoringSchedule | null;
}

interface ScheduleFormData {
    user_id: number;
    assigned_area: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    remarks: string;
}

type RequiredField = Exclude<keyof ScheduleFormData, "remarks">;

function toFormData(schedule: MonitoringSchedule): ScheduleFormData {
    return {
        user_id: schedule.user_id,
        assigned_area: schedule.assigned_area ?? "",
        schedule_date: schedule.schedule_date
            ? toLocalDateString(new Date(schedule.schedule_date))
            : "",
        start_time: schedule.start_time?.slice(0, 5) ?? "",
        end_time: schedule.end_time?.slice(0, 5) ?? "",
        remarks: schedule.remarks ?? "",
    };
}

function getMissingFields(form: ScheduleFormData): RequiredField[] {
    const missing: RequiredField[] = [];
    if (!form.user_id) missing.push("user_id");
    if (!form.assigned_area.trim()) missing.push("assigned_area");
    if (!form.schedule_date) missing.push("schedule_date");
    if (!form.start_time) missing.push("start_time");
    if (!form.end_time) missing.push("end_time");
    return missing;
}

function isSameForm(a: ScheduleFormData, b: ScheduleFormData) {
    return (
        a.user_id === b.user_id &&
        a.assigned_area.trim() === b.assigned_area.trim() &&
        a.schedule_date === b.schedule_date &&
        a.start_time === b.start_time &&
        a.end_time === b.end_time &&
        a.remarks.trim() === b.remarks.trim()
    );
}

export default function UpdateMonitoringModal({
    open,
    onClose,
    schedule,
}: Props) {
    const initialForm = useMemo(() => (schedule ? toFormData(schedule) : null), [schedule]);

    const [form, setForm] = useState<ScheduleFormData | null>(initialForm);
    const [submitted, setSubmitted] = useState(false);

    const { securityPersonnel, getSecurityPersonnel } = useAuth();
    const { updateMonitoringSchedule, getMonitoringSchedules, schedules, loading } = useMonitoring();
    const { showToast } = useToast();

    useEffect(() => {
        getSecurityPersonnel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset the form whenever a different schedule is opened.
    useEffect(() => {
        setForm(initialForm);
        setSubmitted(false);
    }, [initialForm]);

    // Personnel with an unfinished patrol cannot take this one (except its current assignee).
    const personnelWithUnfinishedPatrol = useMemo(
        () =>
            new Set(
                schedules
                    .filter(
                        (s) =>
                            (s.status === "Pending" || s.status === "Ongoing") &&
                            s.schedule_id !== schedule?.schedule_id
                    )
                    .map((s) => s.user_id)
            ),
        [schedules, schedule?.schedule_id]
    );

    if (!schedule || !form || !initialForm) return null;

    const selectedPerson = securityPersonnel.find((p) => p.user_id === form.user_id);
    const missingFields = submitted ? getMissingFields(form) : [];
    const isInvalid = (field: RequiredField) => missingFields.includes(field);
    const isDirty = !isSameForm(form, initialForm);

    const hasTimeRange = form.start_time !== "" && form.end_time !== "";
    const endsNextDay = hasTimeRange && form.end_time <= form.start_time;

    const assigneeName = `${schedule.first_name} ${schedule.last_name}`.trim();

    const update = <K extends keyof ScheduleFormData>(key: K, value: ScheduleFormData[K]) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const handleClose = () => {
        setForm(initialForm);
        setSubmitted(false);
        onClose();
    };

    const handleSave = async () => {
        setSubmitted(true);

        if (getMissingFields(form).length > 0) {
            showToast("error", "Missing Information", "Please complete all required fields.");
            return;
        }

        if (form.schedule_date < getTodayLocal()) {
            showToast("error", "Invalid Date", "Schedule date cannot be in the past.");
            return;
        }

        const result = await updateMonitoringSchedule(schedule.schedule_id, {
            user_id: form.user_id,
            assigned_area: form.assigned_area.trim(),
            schedule_date: form.schedule_date,
            start_time: form.start_time,
            end_time: form.end_time,
            remarks: form.remarks.trim(),
        });

        if (result.success) {
            showToast("success", "Schedule Updated", result.message);
            await getMonitoringSchedules();
            onClose();
        } else {
            showToast("error", "Update Failed", result.message);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen && !loading) handleClose();
            }}
        >
            <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">

                {/* Header */}
                <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 pr-12">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                        <PencilLine className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0">
                        <DialogTitle className="text-[15px] font-semibold tracking-tight text-slate-900">
                            Update Monitoring Schedule
                        </DialogTitle>
                        <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-slate-500">
                            <span className="font-mono tracking-tight">
                                {formatScheduleCode(schedule.schedule_id)}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="truncate">
                                Assigned to{" "}
                                <span className="font-medium text-slate-700">{assigneeName}</span>
                            </span>
                            <ScheduleStatusBadge status={schedule.status} />
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <form
                    id="update-schedule-form"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSave();
                    }}
                    className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-4"
                >

                    <FormSection title="Personnel">
                        <Field
                            id="update-personnel"
                            label="Security personnel"
                            icon={UserRound}
                            required
                            hint="Personnel with an unfinished patrol cannot be reassigned to this schedule."
                        >
                            <Select
                                value={form.user_id ? String(form.user_id) : ""}
                                onValueChange={(value) => update("user_id", value ? Number(value) : 0)}
                            >
                                <SelectTrigger
                                    id="update-personnel"
                                    aria-invalid={isInvalid("user_id")}
                                    className={`w-full ${scheduleInputClass}`}
                                >
                                    <SelectValue>
                                        {selectedPerson ? (
                                            <span className="flex items-center gap-2">
                                                <PersonInitials firstName={selectedPerson.first_name} lastName={selectedPerson.last_name} className="h-5 w-5 bg-amber-100 text-[9px] text-amber-900" />
                                                {selectedPerson.first_name} {selectedPerson.last_name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Select personnel</span>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    {securityPersonnel.map((person) => {
                                        const busy = personnelWithUnfinishedPatrol.has(person.user_id);
                                        const isCurrent = person.user_id === schedule.user_id;

                                        return (
                                            <SelectItem
                                                key={person.user_id}
                                                value={String(person.user_id)}
                                                disabled={busy && !isCurrent}
                                                className="text-[12.5px]"
                                            >
                                                <span className="flex w-full items-center gap-2">
                                                    <PersonInitials firstName={person.first_name} lastName={person.last_name} className="h-6 w-6 bg-slate-100 text-[10px] text-slate-700" />
                                                    <span className="truncate">
                                                        {person.first_name} {person.last_name}
                                                    </span>
                                                    {isCurrent ? (
                                                        <span className="ml-auto rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-amber-800 ring-1 ring-amber-100">
                                                            Current
                                                        </span>
                                                    ) : busy ? (
                                                        <span className="ml-auto rounded-md bg-yellow-50 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-yellow-700 ring-1 ring-yellow-100">
                                                            On patrol
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </Field>
                    </FormSection>

                    <FormSection title="Patrol details">
                        <div className="space-y-3">
                            <Field id="update-area" label="Assigned area" icon={MapPin} required>
                                <Input
                                    id="update-area"
                                    value={form.assigned_area}
                                    placeholder="e.g. Main Gate, Building A – Lobby"
                                    onChange={(e) => update("assigned_area", e.target.value)}
                                    aria-invalid={isInvalid("assigned_area")}
                                    className={scheduleInputClass}
                                />
                            </Field>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <Field id="update-date" label="Date" icon={CalendarDays} required>
                                    <Input
                                        id="update-date"
                                        type="date"
                                        value={form.schedule_date}
                                        min={getTodayLocal()}
                                        onChange={(e) => update("schedule_date", e.target.value)}
                                        aria-invalid={isInvalid("schedule_date")}
                                        className={`${scheduleInputClass} tabular-nums`}
                                    />
                                </Field>

                                <Field id="update-start" label="Start time" icon={Clock} required>
                                    <Input
                                        id="update-start"
                                        type="time"
                                        value={form.start_time}
                                        onChange={(e) => update("start_time", e.target.value)}
                                        aria-invalid={isInvalid("start_time")}
                                        className={`${scheduleInputClass} tabular-nums`}
                                    />
                                </Field>

                                <Field id="update-end" label="End time" icon={Clock} required>
                                    <Input
                                        id="update-end"
                                        type="time"
                                        value={form.end_time}
                                        onChange={(e) => update("end_time", e.target.value)}
                                        aria-invalid={isInvalid("end_time")}
                                        className={`${scheduleInputClass} tabular-nums`}
                                    />
                                </Field>
                            </div>

                            {hasTimeRange && (
                                <div className="flex items-center gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-[11.5px] text-amber-900 ring-1 ring-amber-100">
                                    <Hourglass className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        Shift length{" "}
                                        <span className="font-semibold tabular-nums">
                                            {scheduledDuration(form.start_time, form.end_time)}
                                        </span>
                                        {endsNextDay && " · ends the following day"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </FormSection>

                    <FormSection title="Instructions">
                        <Field id="update-remarks" label="Remarks" icon={StickyNote} optional>
                            <Textarea
                                id="update-remarks"
                                value={form.remarks}
                                onChange={(e) => update("remarks", e.target.value)}
                                placeholder="Checkpoints to cover, special instructions, or areas of concern…"
                                rows={3}
                                className={scheduleTextareaClass}
                            />
                        </Field>
                    </FormSection>
                </form>

                {/* Footer */}
                <DialogFooter className="items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:justify-between sm:gap-2">
                    <p className="text-[11px] text-slate-500">
                        {isDirty ? (
                            <span className="inline-flex items-center gap-1.5 text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Unsaved changes
                            </span>
                        ) : (
                            "No changes yet"
                        )}
                    </p>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="h-9 rounded-xl text-[12.5px]"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            form="update-schedule-form"
                            disabled={loading || !isDirty}
                            className="h-9 gap-1.5 rounded-xl bg-amber-700 text-[12.5px] hover:bg-amber-800"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
