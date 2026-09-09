import { useEffect, useMemo } from "react";
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";
import { Activity, Loader2, TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    useSystemStatusStore,
    type SystemComponentStatus,
} from "@/store/useSystemStatusStore";

/** How often the dashboard re-probes system health. */
const POLL_MS = 30_000;

const statusConfig: Record<
    SystemComponentStatus,
    { dot: string; stroke: string; chip: string; bar: string }
> = {
    Operational: {
        dot: "bg-emerald-500",
        stroke: "#16a34a",
        chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        bar: "bg-emerald-500",
    },
    Degraded: {
        dot: "bg-amber-500",
        stroke: "#d97706",
        chip: "bg-amber-50 text-amber-800 ring-amber-100",
        bar: "bg-amber-500",
    },
    Offline: {
        dot: "bg-red-500",
        stroke: "#dc2626",
        chip: "bg-red-50 text-red-700 ring-red-100",
        bar: "bg-red-500",
    },
};

function timeAgo(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const seconds = Math.max(0, Math.floor(diffMs / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function SystemStatus() {
    const { status, roundTripMs, isLoading, error, getSystemStatus } =
        useSystemStatusStore();

    useEffect(() => {
        getSystemStatus();
        const timer = setInterval(getSystemStatus, POLL_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const components = status?.components ?? [];
    const overall: SystemComponentStatus = status?.overall ?? "Operational";

    const healthPct = useMemo(() => {
        if (!status || status.total === 0) return 0;
        return Math.round((status.operational / status.total) * 100);
    }, [status]);

    const needAttention = components.filter(
        (c) => c.status !== "Operational"
    ).length;

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <Activity className="h-4 w-4 text-amber-800" />
                </div>
                <div>
                    <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                        System Status
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        Live health of every connected system
                    </p>
                </div>
            </div>

            <CardContent className="flex flex-1 flex-col p-5">

                {error && !status ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                            <TriangleAlert className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-700">
                            Status unavailable
                        </p>
                        <p className="max-w-xs text-[11px] text-slate-400">{error}</p>
                    </div>
                ) : !status && isLoading ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        <p className="text-[12px] text-slate-500">
                            Checking systems…
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Overall gauge */}
                        <div className="flex items-center gap-5">
                            <div className="relative h-24 w-24 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="78%"
                                        outerRadius="100%"
                                        data={[
                                            {
                                                value: healthPct,
                                                fill: statusConfig[overall].stroke,
                                            },
                                        ]}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            tick={false}
                                        />
                                        <RadialBar
                                            dataKey="value"
                                            cornerRadius={10}
                                            background={{ fill: "#f1f5f9" }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-[18px] font-semibold tabular-nums tracking-tight text-slate-900">
                                        {healthPct}
                                        <span className="text-[11px] font-normal text-slate-500">
                                            %
                                        </span>
                                    </p>
                                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-500">
                                        Healthy
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 shrink-0 rounded-full ${statusConfig[overall].dot}`}
                                    />
                                    <p className="text-[13px] font-medium text-slate-900">
                                        {overall === "Operational"
                                            ? "All systems operational"
                                            : `${needAttention} system${
                                                  needAttention === 1 ? "" : "s"
                                              } need attention`}
                                    </p>
                                </div>

                                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                                    {status?.operational}/{status?.total} operational
                                    {roundTripMs != null && (
                                        <>
                                            {" · "}
                                            {roundTripMs} ms round-trip
                                        </>
                                    )}
                                    {status?.checked_at && (
                                        <>
                                            {" · checked "}
                                            {timeAgo(status.checked_at)}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Component list */}
                        <div className="mt-5 flex-1 border-t border-slate-100 pt-1">
                            <div className="divide-y divide-slate-100">
                                {components.map((component) => {
                                    const cfg = statusConfig[component.status];

                                    return (
                                        <div
                                            key={component.id}
                                            className="flex items-center gap-3 py-2.5"
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`}
                                            />

                                            <p className="min-w-0 flex-1 truncate text-[12.5px] text-slate-700">
                                                {component.name}
                                            </p>

                                            <span className="hidden shrink-0 text-right text-[11px] tabular-nums text-slate-400 sm:block">
                                                {component.latency_ms != null
                                                    ? `${component.latency_ms} ms`
                                                    : component.detail}
                                            </span>

                                            <span
                                                className={`hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 md:inline-flex ${cfg.chip}`}
                                            >
                                                {component.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

            </CardContent>
        </Card>
    );
}
