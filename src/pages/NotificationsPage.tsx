import { useEffect, useMemo, useState } from "react";
import {
    BellRing,
    Siren,
    TriangleAlert,
    Info,
    Send,
    CalendarClock,
    Check,
    Clock3,
    Users2,
    Loader2,
    Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
    useNotificationStore,
    type NotificationType,
    type NotificationAudience,
} from "@/store/useNotificationStore";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";
const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const typeChip: Record<NotificationType, string> = {
    Emergency: "bg-red-50 text-red-700 ring-red-100",
    Alert: "bg-amber-50 text-amber-800 ring-amber-100",
    Info: "bg-blue-50 text-blue-700 ring-blue-100",
};

const typeTile: Record<NotificationType, string> = {
    Emergency: "bg-red-50 text-red-600 ring-red-100",
    Alert: "bg-amber-50 text-amber-700 ring-amber-100",
    Info: "bg-blue-50 text-blue-600 ring-blue-100",
};

const typeIcon: Record<NotificationType, typeof Siren> = {
    Emergency: Siren,
    Alert: TriangleAlert,
    Info: Info,
};

const TYPES: NotificationType[] = ["Info", "Alert", "Emergency"];
const AUDIENCES: NotificationAudience[] = [
    "All",
    "Security Personnel",
    "Authorized Staff",
];

function fmtDateTime(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/* ================================================================== */
/* Administrator console — 9.1 / 9.2 / 9.3 / 9.4                       */
/* ================================================================== */

function AdminConsole() {
    const { showToast } = useToast();
    const { history, isLoading, isSending, sendNotification, getHistory } =
        useNotificationStore();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<NotificationType>("Info");
    const [audience, setAudience] = useState<NotificationAudience>("All");
    const [scheduleOn, setScheduleOn] = useState(false);
    const [scheduledFor, setScheduledFor] = useState("");

    useEffect(() => {
        getHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canSend =
        title.trim() !== "" &&
        message.trim() !== "" &&
        !isSending &&
        (!scheduleOn || scheduledFor !== "");

    const submit = async () => {
        if (!canSend) return;

        const ok = await sendNotification({
            title: title.trim(),
            message: message.trim(),
            type,
            audience,
            scheduled_for:
                scheduleOn && scheduledFor
                    ? new Date(scheduledFor).toISOString()
                    : null,
        });

        if (ok) {
            showToast(
                "success",
                scheduleOn ? "Notification scheduled" : "Notification sent",
                scheduleOn
                    ? "It will be delivered at the scheduled time."
                    : `Delivered to ${audience}.`
            );
            setTitle("");
            setMessage("");
            setType("Info");
            setAudience("All");
            setScheduleOn(false);
            setScheduledFor("");
        } else {
            showToast("error", "Failed", "Unable to send the notification.");
        }
    };

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />
                <div className="relative flex flex-col gap-1 p-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                        <BellRing className="h-3 w-3" />
                        Notification Management
                    </span>
                    <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                        Send &amp; Broadcast Notifications
                    </h1>
                    <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                        Push system alerts, broadcast emergencies, and schedule notices for
                        Security Personnel and Authorized Staff.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-5">

                {/* Compose */}
                <div className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        Compose
                    </p>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-[11px] font-medium text-slate-600">
                                Title
                            </label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Campus lockdown drill"
                                className="mt-1.5 h-9 rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus-visible:bg-white focus-visible:ring-amber-300"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-medium text-slate-600">
                                Message
                            </label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write the notification details…"
                                rows={4}
                                className="mt-1.5 rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 focus-visible:bg-white focus-visible:ring-amber-300"
                            />
                        </div>

                        <div>
                            <p className="text-[11px] font-medium text-slate-600">Type</p>
                            <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                                {TYPES.map((t) => {
                                    const Icon = typeIcon[t];
                                    const active = type === t;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                                                active
                                                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                                    : "text-slate-500 hover:text-slate-900"
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-medium text-slate-600">
                                Audience
                            </label>
                            <select
                                value={audience}
                                onChange={(e) =>
                                    setAudience(
                                        e.target.value as NotificationAudience
                                    )
                                }
                                className="mt-1.5 h-9 w-full rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                            >
                                {AUDIENCES.map((a) => (
                                    <option key={a} value={a}>
                                        {a === "All"
                                            ? "All personnel & staff"
                                            : a}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                            <label className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={scheduleOn}
                                    onChange={(e) =>
                                        setScheduleOn(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-amber-700 focus:ring-amber-300"
                                />
                                <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                                Schedule for later
                            </label>
                            {scheduleOn && (
                                <Input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                        setScheduledFor(e.target.value)
                                    }
                                    className="mt-2 h-9 rounded-xl border-0 bg-white text-[12.5px] ring-1 ring-slate-200 focus-visible:ring-amber-300"
                                />
                            )}
                        </div>

                        <Button
                            onClick={submit}
                            disabled={!canSend}
                            className="h-9 w-full gap-2 rounded-xl bg-amber-800 text-[12.5px] font-medium text-white hover:bg-amber-900 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                            {isSending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : scheduleOn ? (
                                <CalendarClock className="h-3.5 w-3.5" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            {isSending
                                ? "Sending…"
                                : scheduleOn
                                ? "Schedule notification"
                                : "Send notification"}
                        </Button>
                    </div>
                </div>

                {/* History — 9.4 */}
                <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                            Notification history
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead className={`${headCell} px-5`}>
                                        Notification
                                    </TableHead>
                                    <TableHead className={headCell}>Audience</TableHead>
                                    <TableHead className={headCell}>Status</TableHead>
                                    <TableHead className={headCell}>When</TableHead>
                                    <TableHead className={`${headCell} px-5 text-right`}>
                                        Read / Ack
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((n) => {
                                    const Icon = typeIcon[n.type];
                                    return (
                                        <TableRow
                                            key={n.notification_id}
                                            className="border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${typeTile[n.type]}`}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[12.5px] font-medium text-slate-900">
                                                            {n.title}
                                                        </p>
                                                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                                                            {n.message}
                                                        </p>
                                                        <span
                                                            className={`${chip} mt-1.5 ${typeChip[n.type]}`}
                                                        >
                                                            {n.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-[12px] text-slate-600">
                                                {n.audience}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <span
                                                    className={`${chip} ${
                                                        n.status === "Scheduled"
                                                            ? "bg-violet-50 text-violet-700 ring-violet-100"
                                                            : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                    }`}
                                                >
                                                    {n.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-500">
                                                {n.status === "Scheduled"
                                                    ? fmtDateTime(n.scheduled_for)
                                                    : fmtDateTime(n.sent_at)}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-right text-[11px] tabular-nums text-slate-500">
                                                {n.read_count}/{n.total_recipients}
                                                <span className="mx-1 text-slate-300">
                                                    ·
                                                </span>
                                                <span className="text-emerald-600">
                                                    {n.acknowledged_count} ack
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {!isLoading && history.length === 0 && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell
                                            colSpan={5}
                                            className="py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                                <Inbox className="h-5 w-5 text-amber-800" />
                                            </div>
                                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                                No notifications sent yet
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Alerts and broadcasts you send will appear
                                                here.
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================================================================== */
/* Recipient inbox — 9.5 / 9.6 / 9.7 / 9.8 / 9.9                       */
/* ================================================================== */

function RecipientInbox() {
    const { showToast } = useToast();
    const {
        myNotifications,
        unacknowledgedCount,
        getMyNotifications,
        acknowledge,
    } = useNotificationStore();

    const [filter, setFilter] = useState<"all" | "unacknowledged">("all");

    useEffect(() => {
        getMyNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rows = useMemo(
        () =>
            filter === "unacknowledged"
                ? myNotifications.filter((n) => !n.acknowledged_at)
                : myNotifications,
        [myNotifications, filter]
    );

    const onAck = async (id: number) => {
        const ok = await acknowledge(id);
        if (ok) showToast("success", "Acknowledged", "Notification acknowledged.");
    };

    return (
        <div className="space-y-2">

            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />
                <div className="relative flex flex-col gap-1 p-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                        <BellRing className="h-3 w-3" />
                        Notifications
                    </span>
                    <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                        My Notifications
                    </h1>
                    <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                        Alerts and notices from the administrator. Acknowledge each one so
                        the team knows you have seen it.
                    </p>
                </div>
            </div>

            {/* Filter */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="inline-flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                    {(["all", "unacknowledged"] as const).map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                                filter === f
                                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            {f === "all" ? (
                                <Users2 className="h-3.5 w-3.5" />
                            ) : (
                                <Clock3 className="h-3.5 w-3.5" />
                            )}
                            {f === "all" ? "All" : "Unacknowledged"}
                            <span
                                className={`tabular-nums ${
                                    filter === f
                                        ? "text-amber-700/70"
                                        : "text-slate-400"
                                }`}
                            >
                                {f === "all"
                                    ? myNotifications.length
                                    : unacknowledgedCount}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-2xl bg-white/50 py-16 text-center shadow-sm ring-1 ring-slate-200">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                        <BellRing className="h-5 w-5 text-amber-800" />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                        {filter === "unacknowledged"
                            ? "Nothing to acknowledge"
                            : "No notifications yet"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                        Alerts from the administrator will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {rows.map((n) => {
                        const Icon = typeIcon[n.type];
                        return (
                            <article
                                key={n.notification_id}
                                className="rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200"
                            >
                                <div className="flex gap-3">
                                    <div
                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${typeTile[n.type]}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-[13px] font-semibold text-slate-900">
                                                {n.title}
                                            </p>
                                            <span
                                                className={`${chip} ${typeChip[n.type]}`}
                                            >
                                                {n.type}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
                                            {n.message}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                                            <span>{n.sent_by_name}</span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span>{fmtDateTime(n.sent_at)}</span>
                                        </div>

                                        <div className="mt-3">
                                            {n.acknowledged_at ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                    Acknowledged{" "}
                                                    {fmtDateTime(n.acknowledged_at)}
                                                </span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        onAck(n.notification_id)
                                                    }
                                                    className="h-7 gap-1.5 rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white hover:bg-amber-900"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Acknowledge
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function NotificationsPage() {
    const { user } = useAuth();

    return user?.role === "Administrator" ? <AdminConsole /> : <RecipientInbox />;
}
