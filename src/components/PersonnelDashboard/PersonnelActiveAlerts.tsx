import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Radio,
    Siren,
    TriangleAlert,
    Info,
    Check,
    Clock3,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";

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

/** How recent a delivered notification stays in the "active" feed. */
const RECENT_DAYS = 7;
/** Rows shown per page. */
const PAGE_SIZE = 2;

function relativeTime(value: string | null) {
    if (!value) return "—";
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "—";
    const diff = Date.now() - then;
    const min = Math.round(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    return `${day}d ago`;
}

export default function PersonnelActiveAlerts() {
    const navigate = useNavigate();
    const { myNotifications, getMyNotifications } = useNotificationStore();

    const [page, setPage] = useState(1);

    useEffect(() => {
        getMyNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const active = useMemo(() => {
        const cutoff = Date.now() - RECENT_DAYS * 86_400_000;

        return myNotifications
            .filter(
                (n) =>
                    !n.acknowledged_at ||
                    (n.sent_at
                        ? new Date(n.sent_at).getTime() >= cutoff
                        : false)
            )
            .sort((a, b) => {
                // Unacknowledged first, then most-recently sent.
                const aAck = a.acknowledged_at ? 1 : 0;
                const bAck = b.acknowledged_at ? 1 : 0;
                if (aAck !== bAck) return aAck - bAck;
                return (
                    new Date(b.sent_at ?? 0).getTime() -
                    new Date(a.sent_at ?? 0).getTime()
                );
            });
    }, [myNotifications]);

    const pendingAck = active.filter((n) => !n.acknowledged_at).length;

    const pageCount = Math.max(1, Math.ceil(active.length / PAGE_SIZE));

    useEffect(() => {
        if (page > pageCount) setPage(pageCount);
    }, [page, pageCount]);

    const paged = useMemo(
        () => active.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [active, page]
    );

    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                        <Radio className="h-4 w-4 text-amber-800" />
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                            Active Alerts
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                            {pendingAck > 0
                                ? `${pendingAck} awaiting acknowledgement`
                                : "Alerts from the administrator"}
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
            </div>

            {active.length === 0 ? (
                <div className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                        No active alerts
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                        Alerts from the administrator will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-slate-100">
                        {paged.map((n) => {
                            const Icon = typeIcon[n.type];

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
                                            <p className="truncate text-[12.5px] font-medium leading-none text-slate-900">
                                                {n.title}
                                            </p>
                                            <span
                                                className={`${chip} ${typeChip[n.type]}`}
                                            >
                                                {n.type}
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                                            {n.message}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                                            <span>{n.sent_by_name}</span>
                                            <span className="text-slate-300">·</span>
                                            <span className="tabular-nums">
                                                {relativeTime(n.sent_at)}
                                            </span>
                                        </div>

                                        <div className="mt-2">
                                            {n.acknowledged_at ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                    Acknowledged
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    Awaiting acknowledgement
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
                                {page} / {pageCount}
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
        </div>
    );
}
