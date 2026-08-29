import { Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type IncidentHeaderProps = {
  onCreateIncident: () => void;
};

export default function PersonnelIncidentHeader({
  onCreateIncident,
}: IncidentHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

      {/* Ambient wash */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

      <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
            <TriangleAlert className="h-3 w-3" />
            Incident Management
          </span>

          <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
            My Incident Reports
          </h1>

          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
            Track everything you've reported — progress, assignment, and updates
            through to resolution.
          </p>
        </div>

        <Button
          onClick={onCreateIncident}
          className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Report incident
        </Button>

      </div>

    </div>
  );
}