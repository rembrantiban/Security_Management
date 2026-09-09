import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock3, History, ChevronRight, Loader2 } from "lucide-react";

import { useActivityStore } from "@/store/useActivityStore";
import ActivityLogsModal, {
    actionConfig,
    describeActivity,
} from "@/components/Dashboard/ActivityLogsModal";

/** Newest entries surfaced directly on the dashboard; the rest live in the modal. */
const PREVIEW_COUNT = 3;

const fallback = {
    tile: "bg-slate-50 text-slate-500 ring-slate-200",
    chip: "bg-slate-50 text-slate-500 ring-slate-200",
    icon: History,
};

function relativeTime(value: string) {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "—";

    const diffMin = Math.round((Date.now() - then) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    return `${Math.round(diffHr / 24)}d ago`;
}

export default function ActivityTimeline() {
    const { logs, isLoading, getActivityLogs } = useActivityStore();
    const [viewAll, setViewAll] = useState(false);

    useEffect(() => {
        getActivityLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const recent = useMemo(
        () =>
            [...logs]
                .sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                )
                .slice(0, PREVIEW_COUNT),
        [logs]
    );

    return (
        <Card className="overflow-hidden rounded-2xl border-0 bg-white/50 text-slate-700 shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                        <History className="h-4 w-4 text-amber-800" />
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                            Activity Logs
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Latest system activities and updates
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewAll(true)}
                    className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                >
                    View all
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading && logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        <p className="text-[12px] text-slate-500">
                            Loading activity…
                        </p>
                    </div>
                ) : recent.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <History className="h-5 w-5 text-amber-800" />
                        </div>
                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                            No activity yet
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            System activity will appear here as it happens.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-72">
                        <div className="relative px-5 py-4">
                            {/* Timeline rail */}
                            <div className="absolute bottom-6 left-[38px] top-7 w-px bg-slate-200" />

                            <div className="space-y-1">
                                {recent.map((log) => {
                                    const cfg =
                                        actionConfig[log.action] ?? fallback;
                                    const Icon = cfg.icon;

                                    return (
                                        <div
                                            key={log.activity_id}
                                            className="relative flex gap-3.5"
                                        >
                                            {/* Node */}
                                            <div className="relative z-10 shrink-0 pt-2.5">
                                                <div
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${cfg.tile}`}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <span
                                                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${cfg.chip}`}
                                                        >
                                                            {log.action}
                                                        </span>

                                                        <p className="mt-1.5 truncate text-[13px] leading-snug text-slate-700">
                                                            <span className="font-medium text-slate-900">
                                                                {log.user_name}
                                                            </span>{" "}
                                                            {describeActivity(log)}
                                                        </p>

                                                        {log.role && (
                                                            <p className="mt-1 truncate text-[11px] text-slate-400">
                                                                {log.role}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] tabular-nums text-slate-400">
                                                        <Clock3 className="h-3 w-3" />
                                                        {relativeTime(log.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            <ActivityLogsModal open={viewAll} onOpenChange={setViewAll} />
        </Card>
    );
}
