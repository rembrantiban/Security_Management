import { useEffect, useMemo, useState } from "react";
import {
    ScrollText,
    LogIn,
    LogOut,
    ShieldCheck,
    TriangleAlert,
    Activity,
    Clock3,
    type LucideIcon,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useActivityStore,
    type ActivityAction,
    type ActivityLog,
} from "@/store/useActivityStore";

type Tone = {
    icon: string;
    badge: string;
};

const tones: Record<string, Tone> = {
    emerald: {
        icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    slate: {
        icon: "bg-slate-100 text-slate-500 ring-slate-200",
        badge: "bg-slate-100 text-slate-600 ring-slate-200",
    },
    amber: {
        icon: "bg-amber-50 text-amber-700 ring-amber-100",
        badge: "bg-amber-50 text-amber-800 ring-amber-100",
    },
    red: {
        icon: "bg-red-50 text-red-600 ring-red-100",
        badge: "bg-red-50 text-red-700 ring-red-100",
    },
    blue: {
        icon: "bg-blue-50 text-blue-600 ring-blue-100",
        badge: "bg-blue-50 text-blue-700 ring-blue-100",
    },
};

const actionConfig: Record<
    ActivityAction | "default",
    { icon: LucideIcon; tone: keyof typeof tones; label: string }
> = {
    Login: { icon: LogIn, tone: "emerald", label: "Login" },
    Logout: { icon: LogOut, tone: "slate", label: "Logout" },
    "Visitor Request": { icon: ShieldCheck, tone: "amber", label: "Visitor Request" },
    "Incident Report": { icon: TriangleAlert, tone: "red", label: "Incident Report" },
    default: { icon: Activity, tone: "blue", label: "Activity" },
};

function detailText(log: ActivityLog): string {
    if (log.reference && log.detail) return `${log.reference} — ${log.detail}`;
    return log.reference || log.detail || "";
}

function formatWhen(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function relativeTime(value: string): string {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
    const min = Math.round(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    if (day < 30) return `${day}d ago`;
    return "";
}

const PREVIEW_COUNT = 6;

function LogRow({ log }: { log: ActivityLog }) {
    const cfg = actionConfig[log.action] ?? actionConfig.default;
    const tone = tones[cfg.tone];
    const Icon = cfg.icon;
    const detail = detailText(log);
    const rel = relativeTime(log.created_at);

    return (
        <li className="relative flex gap-3.5">
            <div className="relative z-10 shrink-0 pt-2.5">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${tone.icon}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50/70">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${tone.badge}`}
                        >
                            {cfg.label}
                        </span>

                        {detail && (
                            <p className="mt-1.5 truncate text-[13px] text-gray-700">
                                {detail}
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="whitespace-nowrap text-[11px] tabular-nums text-gray-500">
                            {formatWhen(log.created_at)}
                        </p>
                        {rel && (
                            <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-gray-400">
                                <Clock3 className="h-2.5 w-2.5" />
                                {rel}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

function LogList({ items }: { items: ActivityLog[] }) {
    return (
        <div className="relative px-6 py-4">
            {/* Timeline rail */}
            <div className="absolute bottom-6 left-10 top-7 w-px bg-gray-100" />
            <ul className="space-y-1">
                {items.map((log) => (
                    <LogRow key={log.activity_id} log={log} />
                ))}
            </ul>
        </div>
    );
}

export default function AccountActivityLogs({ userId }: { userId: number }) {
    const { logs, isLoading, error, getActivityLogs } = useActivityStore();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        getActivityLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const userLogs = useMemo(
        () =>
            logs
                .filter((l) => l.user_id === userId)
                .sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                ),
        [logs, userId]
    );

    const preview = userLogs.slice(0, PREVIEW_COUNT);
    const firstLoad = isLoading && logs.length === 0;

    return (
        <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-50 shrink-0">
                        <ScrollText size={15} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">
                            Account Activity Logs
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Recent actions recorded for this account
                        </p>
                    </div>
                </div>

                {userLogs.length > 0 && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 tabular-nums">
                        {userLogs.length}
                    </span>
                )}
            </div>

            {/* Body */}
            {firstLoad ? (
                <div className="px-6 py-5 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 w-24 rounded bg-gray-100" />
                                <div className="h-3 w-40 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="px-6 py-10 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        onClick={() => getActivityLogs()}
                        className="mt-2 text-xs font-medium text-orange-700 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : userLogs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                        <Activity size={18} className="text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600">
                        No activity recorded
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Actions from this account will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <LogList items={preview} />

                    {userLogs.length > PREVIEW_COUNT && (
                        <div className="border-t border-gray-100 px-6 py-3 text-center">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="text-xs font-medium text-orange-700 hover:underline"
                            >
                                View all {userLogs.length} activities
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* View all modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl ring-1 ring-gray-200 sm:max-w-lg">
                    <DialogHeader className="gap-0 border-b border-gray-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-orange-50 shrink-0">
                                <ScrollText size={15} className="text-orange-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-semibold text-gray-800">
                                    Account Activity Logs
                                </DialogTitle>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    {userLogs.length} recorded{" "}
                                    {userLogs.length === 1 ? "activity" : "activities"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh]">
                        <LogList items={userLogs} />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
