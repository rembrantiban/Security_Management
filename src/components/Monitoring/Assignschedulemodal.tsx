import { useEffect, useState } from "react";
import {
  Shield,
  X,
  UserRound,
  MapPin,
  CalendarDays,
  Clock,
  ArrowRight,
  StickyNote,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"
import { useMonitoring } from "@/hooks/useMonitoring"
import { useToast } from "@/hooks/useToast"

interface AssignScheduleModalProps {
  open: boolean;
  onClose: () => void;
  //onAssign?: (data: ScheduleFormData) => void;
}

interface ScheduleFormData {
  user_id: number;
  assigned_area: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  remarks: string;
}


export default function AssignScheduleModal({
  open,
  onClose,
 // onAssign,
}: AssignScheduleModalProps) {
  const [form, setForm] = useState<ScheduleFormData>({
    user_id: 0,
    assigned_area: "",
    schedule_date: "",
    start_time: "",
    end_time: "",
    remarks: "",
  });

  const { createMonitoringSchedule, loading, getMonitoringSchedules } = useMonitoring();
  const { securityPersonnel, getSecurityPersonnel } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getSecurityPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  if (!open) return null;

  const update = (field: keyof ScheduleFormData, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleAssign = async () => {
    if (
        !form.user_id ||
        !form.assigned_area ||
        !form.schedule_date ||
        !form.start_time ||
        !form.end_time
    ) {
        showToast(
            "error",
            "Missing Information",
            "Please complete all required fields."
        );
        return;
    }

    const result = await createMonitoringSchedule(form);

    if (result.success) {
        showToast(
            "success",
            "Schedule Assigned",
            result.message
        );

        // Refresh monitoring schedules
        await getMonitoringSchedules();

        // onAssign?.(form);

        setForm({
            user_id: 0,
            assigned_area: "",
            schedule_date: "",
            start_time: "",
            end_time: "",
            remarks: "",
        });

        onClose();
    } else {
        showToast(
            "error",
            "Assignment Failed",
            result.message
        );
    }
};


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 pt-3 pb-5 text-center border-b border-orange-100 bg-linear-to-b from-orange-50 to-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-200">
            <Shield className="h-6 w-6" />
          </div>

          <h2 className="text-md font-semibold text-slate-900">
            Assign Monitoring Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a monitoring schedule for a security personnel.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Personnel */}
          <Field icon={<UserRound className="h-3.5 w-3.5" />} label="Security Personnel">
            <select value={form.user_id}
              onChange={(e) =>
                update(
                  "user_id",
                  Number(e.target.value)
                )
              }
              className="select-input"
            >
              <option value={0}>
                Select Personnel
              </option>

              {securityPersonnel.map((person) => (
                <option
                  key={person.user_id}
                  value={person.user_id}
                >
                  {person.first_name} {person.last_name}
                </option>
              ))}
            </select>
          </Field>

          {/* Area */}
          <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Assigned Area">
            <input
              type="text"
              value={form.assigned_area}
              placeholder="Enter assigned area"
              onChange={(e) => update("assigned_area", e.target.value)}
              className="select-input"
            />
          </Field>

          {/* Date + Status */}
          <Field icon={<CalendarDays className="h-3.5 w-3.5" />} label="Schedule Date">
            <input
              type="date"
              value={form.schedule_date}
              onChange={(e) => update("schedule_date", e.target.value)}
              className="select-input"
            />
          </Field>

          {/* Time range */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field icon={<Clock className="h-3.5 w-3.5" />} label="Start Time">
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => update("start_time", e.target.value)}
                className="select-input"
              />
            </Field>
            <div className="flex h-9 items-center justify-center text-orange-400">
              <ArrowRight className="h-4 w-4" />
            </div>
            <Field icon={<Clock className="h-3.5 w-3.5" />} label="End Time">
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => update("end_time", e.target.value)}
                className="select-input"
              />
            </Field>
          </div>

          {/* Remarks */}
          <Field icon={<StickyNote className="h-3.5 w-3.5" />} label="Remarks (Optional)">
            <textarea
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Additional instructions..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-orange-200 hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            { loading ? "Assigning..." : "Assign Schedule" }
          </button>
        </div>
      </div>

      <style>{`
        .select-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background-color: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .select-input:focus {
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(254, 215, 170, 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <span className="text-orange-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}