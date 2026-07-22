import {
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react";

export default function UserStats() {
    const { stats,  getUserStatistics } = useAuth();

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
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Active Users",
    value: stats.activeUsers,
    subtitle: "94% Active",
    icon: UserCheck,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Authorized Staff",
    value: stats.authorized_staff,
    subtitle: "Staff accounts with system access",
    icon: Shield,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Deactivated Users",
    value: stats.disabledUsers,
    subtitle: "Need Review",
    icon: UserX,
    color: "from-red-500 to-rose-500",
  },
];
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="group rounded border border-gray-300 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {stat.value}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {stat.subtitle}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded bg-linear-to-br ${stat.color} text-white shadow-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}