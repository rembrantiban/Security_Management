import { ShieldCheck } from "lucide-react";

const PermissionHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

      {/* Ambient wash */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

      <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <ShieldCheck className="h-5 w-5 text-amber-100" />
          </div>

          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
              Incident Reporting &amp; Management
            </span>

            <h1 className="mt-2 text-[18px] font-semibold tracking-tight text-white">
              Incidents
            </h1>

            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-amber-100/70">
              Review reports, assign personnel, and track every incident through
              to resolution.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PermissionHeader;