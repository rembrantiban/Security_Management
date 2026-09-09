import { useEffect, useMemo } from "react";
import {
    CalendarClock,
    Clock3,
    CheckCircle2,
    ClipboardList,
    XCircle,
} from "lucide-react";

import { useMonitoring } from "@/hooks/useMonitoring";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";

type ScheduleStatus = MonitoringSchedule["status"];

const statusCards: {
    status: ScheduleStatus;
    title: string;
    description: string;
    icon: typeof CalendarClock;
    accent: string;
}[] = [
    {
        status: "Pending",
        title: "Pending",
        description: "Not yet started",
        icon: ClipboardList,
        accent: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    },
    {
        status: "Ongoing",
        title: "Ongoing",
        description: "Currently patrolling",
        icon: Clock3,
        accent: "bg-amber-50 text-amber-700 ring-amber-100",
    },
    {
        status: "Completed",
        title: "Completed",
        description: "Finished patrols",
        icon: CheckCircle2,
        accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
        status: "Cancelled",
        title: "Cancelled",
        description: "Called off",
        icon: XCircle,
        accent: "bg-slate-50 text-slate-500 ring-slate-200",
    },
];

export default function MonitoringStats() {
    const { schedules, getMonitoringSchedules } = useMonitoring();

    useEffect(() => {
        getMonitoringSchedules();
    }, [getMonitoringSchedules]);

    // Stats mirror exactly what the table is showing.
    const stats = useMemo(() => {
        const counts = schedules.reduce<Record<string, number>>((acc, row) => {
            acc[row.status] = (acc[row.status] ?? 0) + 1;
            return acc;
        }, {});

        const cards = [
            {
                title: "Total Schedules",
                value: schedules.length,
                description: "Shown in the table",
                icon: CalendarClock,
                accent: "bg-blue-50 text-blue-600 ring-blue-100",
            },
            ...statusCards
                .filter((card) => (counts[card.status] ?? 0) > 0)
                .map((card) => ({
                    title: card.title,
                    value: counts[card.status] ?? 0,
                    description: card.description,
                    icon: card.icon,
                    accent: card.accent,
                })),
        ];

        return cards;
    }, [schedules]);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
