import { useMemo } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useIncidentReport } from "@/hooks/useIncidentsReport";

export default function ViewSecurityAnalytics() {
    const { incidents } = useIncidentReport();

    const weeklyTrend = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));

            return {
                key: date.toISOString().slice(0, 10),
                day: date.toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                incidents: 0,
            };
        });

        incidents.forEach((incident) => {
            const key = new Date(incident.created_at)
                .toISOString()
                .slice(0, 10);

            const day = days.find((d) => d.key === key);

            if (day) {
                day.incidents++;
            }
        });

        return days;
    }, [incidents]);

    const totalIncidents = weeklyTrend.reduce(
        (sum, item) => sum + item.incidents,
        0
    );

    const highestDay =
        weeklyTrend.reduce((prev, current) =>
            current.incidents > prev.incidents ? current : prev
        ) || weeklyTrend[0];

    return (
        <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">

            {/* Header */}
            <div className="flex items-start justify-between">

                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Security Incident Trend
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Showing incident reports recorded during the last 7 days.
                    </p>
                </div>

                <button className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100">
                    This Week
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>

            </div>

            {/* Chart */}
            <div className="mt-5 h-56">

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={weeklyTrend}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="incidentGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#d97706"
                                    stopOpacity={0.30}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#d97706"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            vertical={false}
                            stroke="#fde68a"
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#92400e",
                                fontSize: 10,
                            }}
                        />

                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#92400e",
                                fontSize: 10,
                            }}
                        />

                        <Tooltip
                            cursor={{
                                stroke: "#f59e0b",
                                strokeWidth: 1.5,
                            }}
                            contentStyle={{
                                borderRadius: 10,
                                border: "1px solid #fcd34d",
                                background: "#fff",
                                boxShadow:
                                    "0 8px 20px rgba(0,0,0,.08)",
                            }}
                            labelStyle={{
                                color: "#b45309",
                                fontWeight: 600,
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="#d97706"
                            strokeWidth={2.5}
                            fill="url(#incidentGradient)"
                            dot={{
                                r: 0,
                                fill: "#fff",
                                stroke: "#d97706",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 1,
                                fill: "#fff",
                                stroke: "#b45309",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

            </div>

            {/* Footer */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">

                <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                        <TrendingUp className="h-4 w-4 text-amber-700" />
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Total Incidents
                        </p>

                        <h4 className="text-lg font-bold text-slate-900">
                            {totalIncidents}
                        </h4>
                    </div>

                </div>

                <div className="flex flex-col justify-center">

                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Highest Day
                    </p>

                    <h4 className="text-base font-semibold text-slate-900">
                        {highestDay.day}
                    </h4>

                    <p className="text-xs text-amber-700">
                        {highestDay.incidents} incident
                        {highestDay.incidents !== 1 && "s"}
                    </p>

                </div>

            </div>

        </section>
    );
}