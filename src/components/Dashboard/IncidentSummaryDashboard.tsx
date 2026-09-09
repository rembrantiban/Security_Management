import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Siren,
    Clock,
    Loader2,
    CheckCircle2,
    ChevronRight,
    MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import type { Incident } from "@/store/useIncidentReportStore";

/** Newest incidents surfaced on the dashboard. */
const PREVIEW_COUNT = 5;

const statusConfig: Record<
    Incident["status"],
    { className: string; icon: typeof Clock }
> = {
    Pending: { className: "bg-amber-50 text-amber-800 ring-amber-100", icon: Clock },
    "In Progress": {
        className: "bg-blue-50 text-blue-700 ring-blue-100",
        icon: Loader2,
    },
    Resolved: {
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        icon: CheckCircle2,
    },
    Closed: {
        className: "bg-slate-50 text-slate-500 ring-slate-200",
        icon: CheckCircle2,
    },
};

const severityConfig: Record<
    Incident["severity"],
    { badge: string; dot: string; icon: string }
> = {
    Critical: {
        badge: "bg-red-50 text-red-700 ring-red-100",
        dot: "bg-red-500",
        icon: "bg-red-50 text-red-600 ring-red-100",
    },
    High: {
        badge: "bg-orange-50 text-orange-700 ring-orange-100",
        dot: "bg-orange-500",
        icon: "bg-orange-50 text-orange-600 ring-orange-100",
    },
    Medium: {
        badge: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
        icon: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    },
    Low: {
        badge: "bg-slate-50 text-slate-500 ring-slate-200",
        dot: "bg-slate-300",
        icon: "bg-slate-50 text-slate-400 ring-slate-200",
    },
};

function timeAgo(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function IncidentSummaryDashboard() {
    const navigate = useNavigate();
    const { incidents, isLoading } = useIncidentReport();

    const recent = useMemo(
        () =>
            [...incidents]
                .sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                )
                .slice(0, PREVIEW_COUNT),
        [incidents]
    );

    return (
        <div className="space-y-5">

            {/* Recent incidents */}
            <Card className="overflow-hidden rounded-2xl border-0 bg-white/50 shadow-sm ring-1 ring-slate-200">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <Siren className="h-4 w-4 text-amber-800" />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Recent Incidents
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                                Latest reports across all locations
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/incidents")}
                        className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                    >
                        View all
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>

                <CardContent className="p-0">
                    {isLoading && incidents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-14">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            <p className="text-[12px] text-slate-500">
                                Loading incidents…
                            </p>
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                <Siren className="h-5 w-5 text-amber-800" />
                            </div>
                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                No incidents yet
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                New reports will appear here as they come in.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recent.map((inc) => {
                                const status =
                                    statusConfig[inc.status] ??
                                    statusConfig.Pending;
                                const StatusIcon = status.icon;
                                const sev =
                                    severityConfig[inc.severity] ??
                                    severityConfig.Low;

                                return (
                                    <div
                                        key={inc.incident_id}
                                        className="group relative flex items-center gap-3.5 px-5 py-3 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        {/* Severity accent bar */}
                                        <span
                                            className={`absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${sev.dot}`}
                                        />

                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.icon}`}
                                        >
                                            <Siren className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                    {inc.title}
                                                </p>
                                                <span
                                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${sev.dot}`}
                                                />
                                            </div>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-700">
                                                <span className="font-mono tracking-tight text-slate-700">
                                                    {inc.incident_number}
                                                </span>
                                                <span className="text-slate-300">·</span>
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">
                                                    {inc.location}
                                                </span>
                                                <span className="text-slate-300">·</span>
                                                <span className="tabular-nums">
                                                    {timeAgo(inc.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 sm:inline-flex ${sev.badge}`}
                                        >
                                            {inc.severity}
                                        </span>

                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${status.className}`}
                                        >
                                            <StatusIcon className="h-3 w-3" />
                                            {inc.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
