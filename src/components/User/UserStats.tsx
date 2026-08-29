import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

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
      subtitle: "+12 this month",
      icon: Users,
      accent: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      subtitle: "94% active",
      icon: UserCheck,
      accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
      title: "Authorized Staff",
      value: stats.authorized_staff,
      subtitle: "With system access",
      icon: Shield,
      accent: "bg-violet-50 text-violet-600 ring-violet-100",
    },
    {
      title: "Deactivated Users",
      value: stats.disabledUsers,
      subtitle: "Need review",
      icon: UserX,
      accent: "bg-red-50 text-red-600 ring-red-100",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="group rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300"
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

            <p className="mt-2 text-[11px] text-slate-600">{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}