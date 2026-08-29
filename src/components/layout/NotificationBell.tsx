import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Check,
    Siren,
    TriangleAlert,
    Info,
    X,
} from "lucide-react";
import {
    useNotificationStore,
    type MyNotification,
    type NotificationType,
} from "@/store/useNotificationStore";
import { useToast } from "@/hooks/useToast";
import type { ToastType } from "@/store/useToastStore";

const POLL_MS = 30_000;

const typeMeta: Record<
    NotificationType,
    { icon: typeof Siren; chip: string; tile: string; toast: ToastType }
> = {
    Emergency: {
        icon: Siren,
        chip: "bg-red-50 text-red-700 ring-red-100",
        tile: "bg-red-50 text-red-600 ring-red-100",
        toast: "error",
    },
    Alert: {
        icon: TriangleAlert,
        chip: "bg-amber-50 text-amber-800 ring-amber-100",
        tile: "bg-amber-50 text-amber-700 ring-amber-100",
        toast: "warning",
    },
    Info: {
        icon: Info,
        chip: "bg-blue-50 text-blue-700 ring-blue-100",
        tile: "bg-blue-50 text-blue-600 ring-blue-100",
        toast: "info",
    },
};

function timeAgo(iso: string | null): string {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function NotificationRow({
    n,
    onAcknowledge,
}: {
    n: MyNotification;
    onAcknowledge: () => void;
}) {
    const meta = typeMeta[n.type];
    const Icon = meta.icon;

    return (
        <li className="flex gap-3 px-4 py-3">
            <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.tile}`}
            >
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-[12.5px] font-semibold text-slate-900">
                        {n.title}
                    </p>
                    {!n.read_at && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    )}
                </div>

                <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">
                    {n.message}
                </p>

                <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-slate-400">
                    <span>{n.sent_by_name}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{timeAgo(n.sent_at)}</span>
                </div>

                <div className="mt-2">
                    {n.acknowledged_at ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-600">
                            <Check className="h-3 w-3" />
                            Acknowledged
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={onAcknowledge}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-2.5 py-1 text-[10.5px] font-medium text-white transition hover:bg-amber-900"
                        >
                            <Check className="h-3 w-3" />
                            Acknowledge
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}

export default function NotificationBell() {
    const {
        myNotifications,
        unreadCount,
        unacknowledgedCount,
        getMyNotifications,
        markAllRead,
        acknowledge,
    } = useNotificationStore();
    const { showToast } = useToast();

    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const seenIds = useRef<Set<number>>(new Set());
    const primed = useRef(false);

    useEffect(() => {
        getMyNotifications();
        const timer = setInterval(getMyNotifications, POLL_MS);
        return () => clearInterval(timer);
    }, [getMyNotifications]);

    // Toast only for genuinely new notifications (not the initial load).
    useEffect(() => {
        if (!primed.current) {
            myNotifications.forEach((n) => seenIds.current.add(n.notification_id));
            primed.current = true;
            return;
        }

        myNotifications
            .filter((n) => !seenIds.current.has(n.notification_id))
            .forEach((n) => {
                seenIds.current.add(n.notification_id);
                showToast(
                    typeMeta[n.type].toast,
                    n.type === "Info" ? "New notification" : n.type,
                    n.title
                );
            });
    }, [myNotifications, showToast]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next && unreadCount > 0) markAllRead();
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                onClick={toggle}
                className="relative rounded-xl p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-800"
                aria-label="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                    <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Notifications
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                                {unacknowledgedCount > 0
                                    ? `${unacknowledgedCount} awaiting acknowledgement`
                                    : "You're all caught up"}
                            </p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                        {myNotifications.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                    <Bell className="h-5 w-5 text-amber-800" />
                                </div>
                                <p className="mt-3 text-[12.5px] font-medium text-slate-700">
                                    No notifications yet
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Alerts from the administrator will appear here.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {myNotifications.map((n) => (
                                    <NotificationRow
                                        key={n.notification_id}
                                        n={n}
                                        onAcknowledge={() =>
                                            acknowledge(n.notification_id)
                                        }
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
