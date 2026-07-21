import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";

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
    Operational: { dot: "bg-emerald-500", stroke: "#16a34a" },
    Degraded: { dot: "bg-amber-500", stroke: "#d97706" },
    Offline: { dot: "bg-red-500", stroke: "#dc2626" },
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
        <div className="space-y-5">

            {/* Header */}
            {/* Overall status banner */}
            <Card className="overflow-hidden rounded border-slate-200 shadow-sm">
                <div className="sm:px-6 ">
                    <h1 className="text-sm font-bold text-slate-900 sm:text-xl">
                        System Status
                    </h1>
                    <p className="text-sm text-slate-500">
                        Live health of every system connected to the platform.
                    </p>
                </div>
                <CardContent className="p-6">

                    {/* Filter Tabs */}

                    <div className="mb-6 flex flex-wrap justify-center gap-2">
                        ...
                    </div>

                    {/* Radial */}

                    <div className="flex flex-col items-center">

                        <div className="relative h-32 w-32">

                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="75%"
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
                                    <PolarAngleAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={false}
                                    />

                                    <RadialBar
                                        dataKey="value"
                                        cornerRadius={10}
                                        background={{
                                            fill: "#f1f5f9",
                                        }}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">

                                <p className="text-2xl font-bold">
                                    {overallUptime}%
                                </p>

                                <p className="text-xs text-slate-400">
                                    Avg Uptime
                                </p>

                            </div>

                        </div>

                        <div className="mt-5 text-center">

                            <div className="flex items-center justify-center gap-2">

                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${statusConfig[overallStatus].dot}`}
                                />

                                <p className="font-semibold">

                                    {overallStatus === "Operational"
                                        ? "All Systems Operational"
                                        : `${degradedCount} System${degradedCount > 1 ? "s" : ""
                                        } Need Attention`}

                                </p>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {components.length} systems monitored • Last checked{" "}
                                {timeAgo(
                                    components[0]?.last_checked ??
                                    new Date().toISOString()
                                )}
                            </p>

                        </div>

                    </div>

                </CardContent>
            </Card>

        </div>
    );
}