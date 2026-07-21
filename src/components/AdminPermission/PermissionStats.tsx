import {
  Siren,
  Loader2,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

import { useIncidentReport } from "@/hooks/useIncidentsReport";


const IncidentStats = () => {
  const { stats } = useIncidentReport();

  const stat = [
  {
    title: "Total Incidents",
    value: stats?.total_incidents || "0",
    description: "All Time Reports",
    icon: Siren,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
  },
  {
    title: "Pending Incidents",
    value: stats?.pending_incidents || "0",
    description: "Awaiting Response",
    icon: Loader2,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-50",
  },
  {
    title: "Resolved Incidents",
    value: stats?.resolved_incidents || "0",
    description: "Resolved or Closed",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Assigned Personnel",
    value: stats?.assigned_personnel || "0",
    description: "On Active Cases",
    icon: UserCheck,
    gradient: "from-violet-500 to-indigo-500",
    bg: "bg-violet-50",
  },
];

  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {stat.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              group
              relative
              overflow-hidden
              rounded
              border border-gray-300
              bg-white
              p-3
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-xl
              sm:p-4
            "
          >
            {/* Decorative Background */}
            <div
              className={`absolute right-0 top-0 h-20 w-20 rounded-full ${item.bg} blur-3xl opacity-70 sm:h-28 sm:w-28`}
            />

            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                  {item.title}
                </p>

                <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:mt-2 sm:text-xl">
                  {item.value}
                </h2>

                <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
                  {item.description}
                </p>
              </div>

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient} text-white shadow-lg sm:h-11 sm:w-11 sm:rounded-2xl`}
              >
                <Icon className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
              </div>
            </div>

            {/* Bottom Accent */}
            <div
              className={`mt-3 h-1 rounded-full bg-linear-to-r ${item.gradient} sm:mt-4`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default IncidentStats;