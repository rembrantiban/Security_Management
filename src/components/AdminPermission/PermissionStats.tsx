import {
  Siren,
  Loader2,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

const stats = [
  {
    title: "Total Incidents",
    value: "4",
    description: "All Time Reports",
    icon: Siren,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
  },
  {
    title: "Pending Incidents",
    value: "1",
    description: "Awaiting Response",
    icon: Loader2,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-50",
  },
  {
    title: "Resolved Incidents",
    value: "2",
    description: "Resolved or Closed",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Assigned Personnel",
    value: "3",
    description: "On Active Cases",
    icon: UserCheck,
    gradient: "from-violet-500 to-indigo-500",
    bg: "bg-violet-50",
  },
];

const IncidentStats = () => {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
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
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            {/* Decorative Background */}
            <div
              className={`absolute right-0 top-0 h-28 w-28  rounded-full ${item.bg} blur-3xl opacity-70`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-xl font-bold text-slate-900">
                  {item.value}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {item.description}
                </p>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${item.gradient} text-white shadow-lg`}
              >
                <Icon className="h-7 w-7" />
              </div>
            </div>

            {/* Bottom Accent */}
            <div
              className={`mt-6 h-1 rounded-full bg-linear-to-r ${item.gradient}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default IncidentStats;