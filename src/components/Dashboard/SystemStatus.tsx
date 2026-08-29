import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";
import { Activity } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface SystemComponent {
    id: string;
    name: string;
    status: "Operational" | "Degraded" | "Offline";
    uptime: number;
    last_checked: string;
}

const MOCK_COMPONENTS: SystemComponent[] = [
    { id: "camera", name: "Camera Network", status: "Operational", uptime: 99.8, last_checked: "2026-07-05T09:58:00" },
    { id: "access", name: "Access Control", status: "Operational", uptime: 99.9, last_checked: "2026-07-05T09:58:00" },
    { id: "network", name: "Network / Wi-Fi", status: "Degraded", uptime: 97.2, last_checked: "2026-07-05T09:57:00" },
    { id: "database", name: "Database Server", status: "Operational", uptime: 100, last_checked: "2026-07-05T09:58:00" },
    { id: "notify", name: "Notification Service", status: "Operational", uptime: 99.5, last_checked: "2026-07-05T09:56:00" },
    { id: "backup", name: "Backup Server", status: "Offline", uptime: 82.4, last_checked: "2026-07-05T08:30:00" },
];

const statusConfig = {
    Operational: { dot: "bg-emerald-500", stroke: "#16a34a", chip: "bg-emerald-50 text-emerald-700 ring-emerald-100", bar: "bg-emerald-500" },
    Degraded: { dot: "bg-amber-500", stroke: "#d97706", chip: "bg-amber-50 text-amber-800 ring-amber-100", bar: "bg-amber-500" },
    Offline: { dot: "bg-red-500", stroke: "#dc2626", chip: "bg-red-50 text-red-700 ring-red-100", bar: "bg-red-500" },
};

function timeAgo(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function SystemStatus() {
    const [components] = useState<SystemComponent[]>(MOCK_COMPONENTS);

    const overallUptime = useMemo(
        () => Math.round((components.reduce((s, c) => s + c.uptime, 0) / components.length) * 10) / 10,
        [components]
    );

    const degradedCount = useMemo(
        () => components.filter((c) => c.status !== "Operational").length,
        [components]
    );

    const overallStatus: SystemComponent["status"] = components.some((c) => c.status === "Offline")
        ? "Offline"
        : components.some((c) => c.status === "Degraded")
            ? "Degraded"
            : "Operational";

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
                    <p className="mt-0.5 text-[11px] text-slate-900">
                        Live health of every connected system
                    </p>
                </div>
            </div>

            <CardContent className="flex flex-1 flex-col p-5">

                {/* Overall gauge */}
                <div className="flex items-center gap-5">

                    <div className="relative h-24 w-24 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="78%"
                                outerRadius="100%"
                                data={[
                                    {
                                        value: overallUptime,
                                        fill: statusConfig[overallStatus].stroke,
                                    },
                                ]}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

                                <RadialBar
                                    dataKey="value"
                                    cornerRadius={10}
                                    background={{ fill: "#f1f5f9" }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-[18px] font-semibold tabular-nums tracking-tight text-slate-900">
                                {overallUptime}
                                <span className="text-[11px] font-normal text-slate-700">%</span>
                            </p>
                            <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-700">
                                Uptime
                            </p>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span
                                className={`h-2 w-2 shrink-0 rounded-full ${statusConfig[overallStatus].dot}`}
                            />
                            <p className="text-[13px] font-medium text-slate-900">
                                {overallStatus === "Operational"
                                    ? "All systems operational"
                                    : `${degradedCount} system${degradedCount > 1 ? "s" : ""} need attention`}
                            </p>
                        </div>

                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
                            {components.length} systems monitored · Last checked{" "}
                            {timeAgo(components[0]?.last_checked ?? new Date().toISOString())}
                        </p>
                    </div>
                </div>

                {/* Component list */}
                <div className="mt-5 flex-1 border-t border-slate-100 pt-1">
                    <div className="divide-y divide-slate-100">
                        {components.map((component) => {
                            const config = statusConfig[component.status];

                            return (
                                <div
                                    key={component.id}
                                    className="group flex items-center gap-3 py-2.5 transition-colors duration-200"
                                >
                                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />

                                    <p className="min-w-0 flex-1 truncate text-[12.5px] text-slate-700">
                                        {component.name}
                                    </p>

                                    {/* Uptime bar */}
                                    <div className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:block">
                                        <div
                                            className={`h-full rounded-full ${config.bar}`}
                                            style={{ width: `${component.uptime}%` }}
                                        />
                                    </div>

                                    <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
                                        {component.uptime}%
                                    </span>

                                    <span
                                        className={`hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 md:inline-flex ${config.chip}`}
                                    >
                                        {component.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}