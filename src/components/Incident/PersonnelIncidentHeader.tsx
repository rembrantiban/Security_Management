import { Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type IncidentHeaderProps = {
  onCreateIncident: () => void;
};

export default function PersonnelIncidentHeader({
  onCreateIncident,
}: IncidentHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded border border-orange-100 bg-white shadow-sm">

      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-r from-orange-50 via-white to-orange-100" />

      {/* Decorative blur */}
      <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative flex flex-col gap-6 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div>

          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            <TriangleAlert className="h-3.5 w-3.5" />
            Incident Management
          </span>

          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            My Incident Reports
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            View all incidents you've reported, monitor their progress,
            check assignment status, and follow updates until each incident
            has been resolved.
          </p>

        </div>

        {/* Right */}
        <Button
          size="lg"
          onClick={onCreateIncident}
          className="rounded-xl text-xs bg-orange-700 px-6 shadow-md hover:bg-orange-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>

      </div>

    </div>
  );
}