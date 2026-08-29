import {
    CalendarClock,
    Clock3,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";

import { useMonitoring } from "@/hooks/useMonitoring";

export default function MonitoringStats() {
    const { statistics } = useMonitoring();

    const stats = [
        {
            title: "Total Schedules",
            value: statistics?.total_schedules ?? 0,
            description: "All-time schedules",
            icon: CalendarClock,
            accent: "bg-blue-50 text-blue-600 ring-blue-100",
        },
        {
            title: "Pending",
            value: statistics?.pending_schedules ?? 0,
            description: "Not yet started",
            icon: ClipboardList,
            accent: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        },
        {
            title: "Ongoing",
            value: statistics?.ongoing_schedules ?? 0,
            description: "Currently patrolling",
            icon: Clock3,
            accent: "bg-amber-50 text-amber-700 ring-amber-100",
        },
        {
            title: "Completed",
            value: statistics?.completed_schedules ?? 0,
            description: "Finished patrols",
            icon: CheckCircle2,
            accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.title}
                        className="rounded-2xl bg-white/50 px-6 py-3 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-700">
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
}