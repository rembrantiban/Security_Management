import {
    CalendarClock,
    Clock3,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";

const stats = [
    {
        title: "Total Schedules",
        value: 12,
        icon: CalendarClock,
        color: "bg-blue-100 text-blue-700",
    },
    {
        title: "Pending",
        value: 4,
        icon: ClipboardList,
        color: "bg-yellow-100 text-yellow-700",
    },
    {
        title: "Ongoing",
        value: 3,
        icon: Clock3,
        color: "bg-green-100 text-green-700",
    },
    {
        title: "Completed",
        value: 5,
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-700",
    },
];

export default function MonitoringStats() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.title}
                        className="rounded-2xl border bg-white p-5 shadow-xs"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    {item.title}
                                </p>

                                <h2 className="mt-2 text-3xl font-bold">
                                    {item.value}
                                </h2>

                            </div>

                            <div
                                className={`rounded-xl p-3 ${item.color}`}
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