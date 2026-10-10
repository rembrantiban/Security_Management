import { useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Incident } from "@/store/useIncidentReportStore";
import { INCIDENT_STATUSES } from "./incidentStatus";

type StatusSlice = {
    key: Incident["status"];
    value: number;
    color: string;
};

const SEVERITIES: { key: Incident["severity"]; bar: string }[] = [
    { key: "Critical", bar: "bg-red-500" },
    { key: "High", bar: "bg-orange-500" },
    { key: "Medium", bar: "bg-yellow-500" },
    { key: "Low", bar: "bg-slate-400" },
];

const EMPTY_RING = [{ value: 1 }];

/** Status and severity breakdown of the incidents shown in the table. */
export default function IncidentReportSummary({ incidents }: { incidents: Incident[] }) {
    const { statuses, severities, total, open } = useMemo(() => {
        const countBy = <K extends keyof Incident>(field: K, value: Incident[K]) =>
            incidents.filter((i) => i[field] === value).length;

        const statuses: StatusSlice[] = INCIDENT_STATUSES.map((s) => ({
            key: s.key,
            color: s.color,
            value: countBy("status", s.key),
        }));

        return {
            total: incidents.length,
            open: countBy("status", "Pending") + countBy("status", "In Progress"),
            statuses,
            severities: SEVERITIES.map((s) => ({ ...s, value: countBy("severity", s.key) })),
        };
    }, [incidents]);

    const percentOf = (value: number) => (total ? Math.round((value / total) * 100) : 0);
    const visibleSlices = statuses.filter((s) => s.value > 0);

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <PieChartIcon className="h-4 w-4 text-amber-800" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">
                        Incident Report Summary
                    </h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        {open} open of {total} reported
                    </p>
                </div>
            </div>

            <div className="p-4">
                {/* Status donut */}
                <div
                    className="relative mx-auto h-36 w-36"
                    role="img"
                    aria-label={statuses.map((s) => `${s.key}: ${s.value}`).join(", ")}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {total === 0 ? (
                                <Pie
                                    data={EMPTY_RING}
                                    dataKey="value"
                                    innerRadius="74%"
                                    outerRadius="100%"
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    <Cell fill="#f1f5f9" />
                                </Pie>
                            ) : (
                                <Pie
                                    data={visibleSlices}
                                    dataKey="value"
                                    nameKey="key"
                                    innerRadius="74%"
                                    outerRadius="100%"
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={visibleSlices.length > 1 ? 3 : 0}
                                    cornerRadius={4}
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {visibleSlices.map((slice) => (
                                        <Cell key={slice.key} fill={slice.color} />
                                    ))}
                                </Pie>
                            )}
                            {total > 0 && (
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ zIndex: 20, outline: "none" }}
                                    content={({ active, payload }) => {
                                        const item = payload?.[0]?.payload as StatusSlice | undefined;
                                        if (!active || !item) return null;
                                        return (
                                            <div className="whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] shadow-md ring-1 ring-slate-200">
                                                <span className="font-medium text-slate-900">{item.key}</span>
                                                <span className="ml-1.5 tabular-nums text-slate-500">
                                                    {item.value} · {percentOf(item.value)}%
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[24px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                            {total}
                        </p>
                        <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-slate-500">
                            Total
                        </p>
                    </div>
                </div>

                {/* Status legend */}
                <ul className="mt-4 space-y-1.5">
                    {statuses.map((s) => (
                        <li key={s.key} className="flex items-center gap-2 text-[12px]">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: s.color }}
                                aria-hidden="true"
                            />
                            <span className="flex-1 text-slate-600">{s.key}</span>
                            <span className="font-medium tabular-nums text-slate-900">{s.value}</span>
                            <span className="w-9 text-right tabular-nums text-slate-400">
                                {percentOf(s.value)}%
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Severity breakdown */}
                <div className="mt-4 border-t border-slate-100 pt-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        By severity
                    </p>
                    <ul className="mt-2.5 space-y-2.5">
                        {severities.map((s) => (
                            <li key={s.key}>
                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-slate-600">{s.key}</span>
                                    <span className="font-medium tabular-nums text-slate-900">{s.value}</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${s.bar}`}
                                        style={{ width: `${percentOf(s.value)}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
