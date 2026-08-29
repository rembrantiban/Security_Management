import { Siren, Loader2, CheckCircle2, UserCheck } from "lucide-react";

import { useIncidentReport } from "@/hooks/useIncidentsReport";

const IncidentStats = () => {
  const { stats } = useIncidentReport();

  const stat = [
    {
      title: "Total Incidents",
      value: stats?.total_incidents || "0",
      description: "All-time reports",
      icon: Siren,
      accent: "bg-amber-50 text-amber-700 ring-amber-100",
    },
    {
      title: "Pending",
      value: stats?.pending_incidents || "0",
      description: "Awaiting response",
      icon: Loader2,
      accent: "bg-red-50 text-red-600 ring-red-100",
    },
    {
      title: "Resolved",
      value: stats?.resolved_incidents || "0",
      description: "Resolved or closed",
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
      title: "Assigned Personnel",
      value: stats?.assigned_personnel || "0",
      description: "On active cases",
      icon: UserCheck,
      accent: "bg-violet-50 text-violet-600 ring-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {stat.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl bg-white/50 px-6 py-2 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-900">
                {item.title}
              </p>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${item.accent}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {item.value}
            </p>

            <p className="mt-2 truncate text-[11px] text-slate-700">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default IncidentStats;