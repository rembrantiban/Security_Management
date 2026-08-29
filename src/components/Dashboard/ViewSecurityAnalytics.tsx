import { useMemo } from "react";
import { ChevronDown, TrendingUp, ChartSpline } from "lucide-react";
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

    const dailyAverage = Math.round((totalIncidents / 7) * 10) / 10;

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">

                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                        <ChartSpline className="h-4 w-4 text-amber-800" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                            Security Incident Trend
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-700">
                            Reports recorded over the last 7 days
                        </p>
                    </div>
                </div>

                <button className="flex h-7 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100 transition hover:bg-amber-50">
                    This Week
                    <ChevronDown className="h-3 w-3" />
                </button>

            </div>

            {/* Chart */}
            <div className="flex-1 px-2 pt-5">
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={weeklyTrend}
                            margin={{ top: 6, right: 12, left: -22, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#92400e" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#92400e" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="#f1f5f9"
                                strokeDasharray="0"
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                dy={6}
                                tick={{ fill: "#94a3b8", fontSize: 10 }}
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                                tick={{ fill: "#cbd5e1", fontSize: 10 }}
                            />

                            <Tooltip
                                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    padding: "8px 12px",
                                    fontSize: 12,
                                    boxShadow: "0 8px 24px rgba(15,23,42,.08)",
                                }}
                                labelStyle={{
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    fontSize: 12,
                                    marginBottom: 2,
                                }}
                                itemStyle={{ color: "#92400e", fontSize: 12 }}
                            />

                            <Area
                                type="monotone"
                                dataKey="incidents"
                                stroke="#92400e"
                                strokeWidth={2}
                                fill="url(#incidentGradient)"
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    fill: "#fff",
                                    stroke: "#92400e",
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">

                <div className="px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                        Total
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <p className="text-[18px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                            {totalIncidents}
                        </p>
                        <TrendingUp className="h-3.5 w-3.5 text-amber-700" />
                    </div>
                </div>

                <div className="px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                        Daily avg
                    </p>
                    <p className="mt-1.5 text-[18px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                        {dailyAverage}
                    </p>
                </div>

                <div className="px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                        Peak day
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <p className="text-[18px] font-semibold leading-none tracking-tight text-slate-900">
                            {highestDay.day}
                        </p>
                        <p className="text-[11px] tabular-nums text-amber-700">
                            {highestDay.incidents}
                        </p>
                    </div>
                </div>

            </div>

        </section>
    );
}