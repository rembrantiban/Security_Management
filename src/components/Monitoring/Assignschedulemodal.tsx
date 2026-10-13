import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Hourglass,
  Loader2,
  MapPin,
  ShieldCheck,
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
import { scheduledDuration } from "@/lib/patrolSchedule";
import { useAuth } from "@/hooks/useAuth";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/useToast";
import { getTodayLocal } from "@/lib/date";

interface AssignScheduleModalProps {
  open: boolean;
  onClose: () => void;
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

const EMPTY_FORM: ScheduleFormData = {
  user_id: 0,
  assigned_area: "",
  schedule_date: "",
  start_time: "",
  end_time: "",
  remarks: "",
};

function getMissingFields(form: ScheduleFormData): RequiredField[] {
  const missing: RequiredField[] = [];
  if (!form.user_id) missing.push("user_id");
  if (!form.assigned_area.trim()) missing.push("assigned_area");
  if (!form.schedule_date) missing.push("schedule_date");
  if (!form.start_time) missing.push("start_time");
  if (!form.end_time) missing.push("end_time");
  return missing;
}

export default function AssignScheduleModal({
  open,
  onClose,
}: AssignScheduleModalProps) {
  const [form, setForm] = useState<ScheduleFormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const { createMonitoringSchedule, loading, schedules, getMonitoringSchedules } = useMonitoring();
  const { securityPersonnel, getSecurityPersonnel } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getSecurityPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Personnel can only take a new patrol once all their previous patrols are completed.
  const personnelWithUnfinishedPatrol = useMemo(
    () =>
      new Set(
        schedules
          .filter((s) => s.status === "Pending" || s.status === "Ongoing")
          .map((s) => s.user_id)
      ),
    [schedules]
  );

  const availableCount = securityPersonnel.filter(
    (p) => !personnelWithUnfinishedPatrol.has(p.user_id)
  ).length;

  const selectedPerson = securityPersonnel.find((p) => p.user_id === form.user_id);
  const missingFields = submitted ? getMissingFields(form) : [];
  const isInvalid = (field: RequiredField) => missingFields.includes(field);

  const hasTimeRange = form.start_time !== "" && form.end_time !== "";
  const endsNextDay = hasTimeRange && form.end_time <= form.start_time;

  const update = <K extends keyof ScheduleFormData>(field: K, value: ScheduleFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setSubmitted(false);
    onClose();
  };

  const handleAssign = async () => {
    setSubmitted(true);

    if (getMissingFields(form).length > 0) {
      showToast("error", "Missing Information", "Please complete all required fields.");
      return;
    }

    if (form.schedule_date < getTodayLocal()) {
      showToast("error", "Invalid Date", "Schedule date cannot be in the past.");
      return;
    }

    const result = await createMonitoringSchedule({
      ...form,
      assigned_area: form.assigned_area.trim(),
      remarks: form.remarks.trim(),
    });

    if (result.success) {
      showToast("success", "Schedule Assigned", result.message);
      await getMonitoringSchedules();
      handleClose();
    } else {
      showToast("error", "Assignment Failed", result.message);
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
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-semibold tracking-tight text-slate-900">
              Assign Monitoring Schedule
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[12px] text-slate-500">
              Schedule a patrol duty for a security personnel.
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <form
          id="assign-schedule-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void handleAssign();
          }}
          className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-4"
        >

          <FormSection title="Personnel">
            <Field
              id="schedule-personnel"
              label="Security personnel"
              icon={UserRound}
              required
              hint={`${availableCount} of ${securityPersonnel.length} available · personnel with an unfinished patrol cannot be assigned`}
            >
              <Select
                value={form.user_id ? String(form.user_id) : ""}
                onValueChange={(value) => update("user_id", value ? Number(value) : 0)}
              >
                <SelectTrigger
                  id="schedule-personnel"
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
                  {securityPersonnel.length === 0 ? (
                    <p className="px-3 py-2 text-[12px] text-slate-500">
                      No active security personnel found.
                    </p>
                  ) : (
                    securityPersonnel.map((person) => {
                      const busy = personnelWithUnfinishedPatrol.has(person.user_id);

                      return (
                        <SelectItem
                          key={person.user_id}
                          value={String(person.user_id)}
                          disabled={busy}
                          className="text-[12.5px]"
                        >
                          <span className="flex w-full items-center gap-2">
                            <PersonInitials firstName={person.first_name} lastName={person.last_name} className="h-6 w-6 bg-slate-100 text-[10px] text-slate-700" />
                            <span className="truncate">
                              {person.first_name} {person.last_name}
                            </span>
                            {busy && (
                              <span className="ml-auto rounded-md bg-yellow-50 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-yellow-700 ring-1 ring-yellow-100">
                                On patrol
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          <FormSection title="Patrol details">
            <div className="space-y-3">
              <Field id="schedule-area" label="Assigned area" icon={MapPin} required>
                <Input
                  id="schedule-area"
                  value={form.assigned_area}
                  placeholder="e.g. Main Gate, Building A – Lobby"
                  onChange={(e) => update("assigned_area", e.target.value)}
                  aria-invalid={isInvalid("assigned_area")}
                  className={scheduleInputClass}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field id="schedule-date" label="Date" icon={CalendarDays} required>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={form.schedule_date}
                    min={getTodayLocal()}
                    onChange={(e) => update("schedule_date", e.target.value)}
                    aria-invalid={isInvalid("schedule_date")}
                    className={`${scheduleInputClass} tabular-nums`}
                  />
                </Field>

                <Field id="schedule-start" label="Start time" icon={Clock} required>
                  <Input
                    id="schedule-start"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => update("start_time", e.target.value)}
                    aria-invalid={isInvalid("start_time")}
                    className={`${scheduleInputClass} tabular-nums`}
                  />
                </Field>

                <Field id="schedule-end" label="End time" icon={Clock} required>
                  <Input
                    id="schedule-end"
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
            <Field id="schedule-remarks" label="Remarks" icon={StickyNote} optional>
              <Textarea
                id="schedule-remarks"
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
        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:gap-2">
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
            form="assign-schedule-form"
            disabled={loading}
            className="h-9 gap-1.5 rounded-xl bg-amber-700 text-[12.5px] hover:bg-amber-800"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Assign Schedule
              </>
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
