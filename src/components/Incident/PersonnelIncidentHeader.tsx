import { Plus, AlertTriangle, Clock, CheckCircle2, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

type IncidentHeaderProps = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  onCreateIncident: () => void;
};

export default function PersonnelIncidentHeader({
  total,
  pending,
  inProgress,
  resolved,
  onCreateIncident,
}: IncidentHeaderProps) {
  const stats = [
    {
      label: "Total Reported",
      value: total,
      icon: <FileWarning size={16} />,
      accent: "text-orange-700 bg-orange-50 border-orange-200",
    },
    {
      label: "Pending",
      value: pending,
      icon: <Clock size={16} />,
      accent: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: <AlertTriangle size={16} />,
      accent: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: <CheckCircle2 size={16} />,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="mb-2">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Incident Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Incidents you've reported and their current status.
          </p>
        </div>

        <Button
          onClick={onCreateIncident}
          className="bg-linear-to-r from-orange-700 to-amber-700 text-white shadow-sm shadow-orange-900/30 hover:brightness-105 rounded-xl gap-2 px-4 h-10"
        >
          <Plus size={16} />
          Report Incident
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded border border-gray-300 bg-white px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${s.accent}`}
              >
                {s.icon}
              </span>
              <span className="text-xl font-semibold text-gray-800">{s.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}