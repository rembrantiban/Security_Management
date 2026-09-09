import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Megaphone,
    BellRing,
    ShieldCheck,
    Siren,
    TriangleAlert,
    Info,
    Check,
    Clock3,
    ChevronRight,
    Inbox,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    useNotificationStore,
    type MyNotification,
    type NotificationType,
} from "@/store/useNotificationStore";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const alertTile: Record<Exclude<NotificationType, "Info">, string> = {
    Emergency: "bg-red-50 text-red-600 ring-red-100",
    Alert: "bg-amber-50 text-amber-700 ring-amber-100",
};

const alertChip: Record<Exclude<NotificationType, "Info">, string> = {
    Emergency: "bg-red-50 text-red-700 ring-red-100",
    Alert: "bg-amber-50 text-amber-800 ring-amber-100",
};

const alertIcon: Record<Exclude<NotificationType, "Info">, typeof Siren> = {
    Emergency: Siren,
    Alert: TriangleAlert,
};

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
    return `${Math.round(hr / 24)}d ago`;
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { myNotifications, getMyNotifications } = useNotificationStore();

    useEffect(() => {
        getMyNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const firstName = user?.first_name || "there";

    const bySentDesc = (a: MyNotification, b: MyNotification) =>
        new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime();

    const announcements = useMemo(
        () =>
            myNotifications
                .filter((n) => n.type === "Info")
                .sort(bySentDesc),
        [myNotifications]
    );

    const alerts = useMemo(
        () =>
            myNotifications
                .filter((n) => n.type !== "Info")
                .sort((a, b) => {
                    // Unread first, then most recent.
                    const aRead = a.read_at ? 1 : 0;
                    const bRead = b.read_at ? 1 : 0;
                    if (aRead !== bRead) return aRead - bRead;
                    return bySentDesc(a, b);
                }),
        [myNotifications]
    );

    const unreadAlerts = alerts.filter((n) => !n.read_at).length;

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                            <ShieldCheck className="h-3 w-3" />
                            Authorized Staff
                        </span>

                        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-white">
                            Welcome back, {firstName}
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Stay up to date with campus announcements and security alerts.
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center ring-1 ring-white/15">
                            <p className="text-[18px] font-semibold leading-none tabular-nums text-white">
                                {announcements.length}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-100/70">
                                Announcements
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center ring-1 ring-white/15">
                            <p className="text-[18px] font-semibold leading-none tabular-nums text-white">
                                {unreadAlerts}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-100/70">
                                Unread alerts
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">

                {/* Security Announcements */}
                <section className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                <Megaphone className="h-4 w-4 text-amber-800" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                    Security Announcements
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Campus-wide updates from administrators
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

                    <div className="divide-y divide-slate-100">
                        {announcements.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="No announcements yet"
                                description="Campus-wide announcements from administrators will appear here."
                            />
                        ) : (
                            announcements.map((item) => (
                                <article
                                    key={item.notification_id}
                                    className="px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                        <h3 className="text-[13px] font-semibold text-slate-900">
                                            {item.title}
                                        </h3>
                                        {!item.read_at && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        )}
                                    </div>

                                    <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                                        {item.message}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                                        <span>{item.sent_by_name}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-3 w-3" />
                                            {relativeTime(item.sent_at)}
                                        </span>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Alerts & Notifications */}
                <section className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                <BellRing className="h-4 w-4 text-amber-800" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                    Alerts &amp; Notifications
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Security alerts and system notifications
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

                    <div className="space-y-2 p-3">
                        {alerts.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="No alerts right now"
                                description="Security alerts and system notifications will show up here."
                            />
                        ) : (
                            alerts.map((alert) => {
                                const level = alert.type as Exclude<
                                    NotificationType,
                                    "Info"
                                >;
                                const Icon = alertIcon[level];

                                return (
                                    <div
                                        key={alert.notification_id}
                                        className="rounded-xl bg-white/70 p-3.5 ring-1 ring-slate-200 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${alertTile[level]}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <h3 className="text-[12.5px] font-semibold text-slate-900">
                                                        {alert.title}
                                                    </h3>
                                                    <span
                                                        className={`${chip} ${alertChip[level]}`}
                                                    >
                                                        {alert.type}
                                                    </span>
                                                    {!alert.read_at && (
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                    )}
                                                </div>

                                                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                                    {alert.message}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                                                    <span>{alert.sent_by_name}</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="tabular-nums">
                                                        {relativeTime(alert.sent_at)}
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    {alert.acknowledged_at ? (
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
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                <Icon className="h-5 w-5 text-amber-800" />
            </div>
            <p className="text-[13px] font-medium text-slate-700">{title}</p>
            <p className="mt-1 max-w-sm text-[11px] text-slate-400">{description}</p>
        </div>
    );
}
