import { Users, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import UserSummary from "./UserSummary";

export default function UserStats() {
  const { stats, getUserStatistics } = useAuth();

  useEffect(() => {
    getUserStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      accent: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="group rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-700">
                {stat.title}
              </p>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${stat.accent}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {stat.value}
            </p>
          </div>
        );
      })}

      <UserSummary />
    </div>
  );
}