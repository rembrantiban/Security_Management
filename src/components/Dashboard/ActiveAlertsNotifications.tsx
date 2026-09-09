import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BellRing,
    Siren,
    TriangleAlert,
    Info,
    CalendarClock,
    CheckCheck,
    Users2,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    useNotificationStore,
    type NotificationType,
} from "@/store/useNotificationStore";

const chip =
    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const typeTile: Record<NotificationType, string> = {
    Emergency: "bg-red-50 text-red-600 ring-red-100",
    Alert: "bg-amber-50 text-amber-700 ring-amber-100",
    Info: "bg-blue-50 text-blue-600 ring-blue-100",
};

const typeChip: Record<NotificationType, string> = {
    Emergency: "bg-red-50 text-red-700 ring-red-100",
    Alert: "bg-amber-50 text-amber-800 ring-amber-100",
    Info: "bg-blue-50 text-blue-700 ring-blue-100",
};

const typeIcon: Record<NotificationType, typeof Siren> = {
    Emergency: Siren,
    Alert: TriangleAlert,
    Info: Info,
};

/** How far back a delivered notification still counts as "active". */
const RECENT_DAYS = 7;

/** Rows shown per page. */
const PAGE_SIZE = 2;

function fmt(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function ActiveAlertsNotifications() {
    const navigate = useNavigate();
    const { history, isLoading, getHistory } = useNotificationStore();

    const [page, setPage] = useState(1);

    useEffect(() => {
        getHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const active = useMemo(() => {
        const cutoff = Date.now() - RECENT_DAYS * 86_400_000;

        return history
            .filter(
                (n) =>
                    n.status === "Scheduled" ||
                    (n.sent_at
                        ? new Date(n.sent_at).getTime() >= cutoff
                        : false)
            )
            .sort((a, b) => {
                // Scheduled (upcoming) first, then most-recently delivered.
                if (a.status !== b.status)
                    return a.status === "Scheduled" ? -1 : 1;

                const at = new Date(
                    a.status === "Scheduled"
                        ? a.scheduled_for ?? 0
                        : a.sent_at ?? 0
                ).getTime();
                const bt = new Date(
                    b.status === "Scheduled"
                        ? b.scheduled_for ?? 0
                        : b.sent_at ?? 0
                ).getTime();

                return a.status === "Scheduled" ? at - bt : bt - at;
            });
    }, [history]);

    const alertCount = active.filter((n) => n.type !== "Info").length;
    const scheduledCount = active.filter((n) => n.status === "Scheduled").length;

    const pageCount = Math.max(1, Math.ceil(active.length / PAGE_SIZE));

    useEffect(() => {
        if (page > pageCount) setPage(pageCount);
    }, [page, pageCount]);

    const paged = useMemo(
        () => active.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [active, page]
    );

    return (
        <Card className="overflow-hidden rounded-2xl border-0 bg-white/50 shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                        <BellRing className="h-4 w-4 text-amber-800" />
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                            Active Alerts &amp; Notifications
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                            {active.length} active
                            <span className="mx-1 text-slate-300">·</span>
                            {alertCount} alert{alertCount === 1 ? "" : "s"}
                            <span className="mx-1 text-slate-300">·</span>
                            {scheduledCount} scheduled
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/notifications")}
                    className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                >
                    View all
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                {!isLoading && active.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <Inbox className="h-5 w-5 text-amber-800" />
                        </div>
                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                            No active alerts
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Scheduled and recently sent notifications will appear
                            here.
                        </p>
                    </div>
                ) : (
                    <>
                    <ul className="divide-y divide-slate-100">
                        {paged.map((n) => {
                            const Icon = typeIcon[n.type];
                            const scheduled = n.status === "Scheduled";

                            return (
                                <li
                                    key={n.notification_id}
                                    className="flex gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${typeTile[n.type]}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate text-[12.5px] font-medium text-slate-900">
                                                {n.title}
                                            </p>
                                            <span
                                                className={`${chip} ${typeChip[n.type]}`}
                                            >
                                                {n.type}
                                            </span>
                                            {scheduled && (
                                                <span
                                                    className={`${chip} bg-violet-50 text-violet-700 ring-violet-100`}
                                                >
                                                    Scheduled
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                                            {n.message}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <Users2 className="h-3 w-3" />
                                                {n.audience}
                                            </span>
                                            <span className="inline-flex items-center gap-1 tabular-nums">
                                                <CalendarClock className="h-3 w-3" />
                                                {scheduled
                                                    ? fmt(n.scheduled_for)
                                                    : fmt(n.sent_at)}
                                            </span>
                                            {!scheduled && (
                                                <span className="inline-flex items-center gap-1 tabular-nums">
                                                    <CheckCheck className="h-3 w-3" />
                                                    {n.read_count}/
                                                    {n.total_recipients} read
                                                    <span className="mx-0.5 text-slate-300">
                                                        ·
                                                    </span>
                                                    <span className="text-emerald-600">
                                                        {n.acknowledged_count} ack
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                        <p className="text-[11px] tabular-nums text-slate-400">
                            {(page - 1) * PAGE_SIZE + 1}–
                            {Math.min(page * PAGE_SIZE, active.length)} of{" "}
                            {active.length}
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Prev
                            </button>

                            <span className="px-2 text-[11px] tabular-nums text-slate-500">
                                Page {page} of {pageCount}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.min(pageCount, p + 1))
                                }
                                disabled={page >= pageCount}
                                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
