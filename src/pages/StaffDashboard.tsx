import {
    Megaphone,
    BellRing,
    ShieldCheck,
    Siren,
    AlertTriangle,
    Info,
    Pin,
    Clock3,
    MapPin,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Announcement = {
    id: string;
    title: string;
    message: string;
    priority: "Important" | "Normal";
    postedBy: string;
    postedAt: string;
    pinned?: boolean;
};

type AlertItem = {
    id: string;
    title: string;
    description: string;
    area: string;
    level: "Critical" | "Warning" | "Info";
    time: string;
    unread?: boolean;
};

const announcements: Announcement[] = [
    {
        id: "ANN-104",
        title: "Campus-wide fire drill this Friday",
        message:
            "A scheduled fire drill will be conducted at 2:00 PM. All staff must proceed to designated assembly points and remain until the all-clear signal.",
        priority: "Important",
        postedBy: "Administrator",
        postedAt: "Today, 9:12 AM",
        pinned: true,
    },
    {
        id: "ANN-103",
        title: "Visitor registration counter relocated",
        message:
            "The visitor registration desk has moved to the East Lobby effective immediately to accommodate ongoing renovations at the Main Gate.",
        priority: "Normal",
        postedBy: "Administrator",
        postedAt: "Yesterday, 4:45 PM",
    },
    {
        id: "ANN-102",
        title: "Updated ID verification procedure",
        message:
            "All personnel are reminded to present a valid ID before entering restricted areas. Security personnel have been briefed on the updated checklist.",
        priority: "Normal",
        postedBy: "IT System Administrator",
        postedAt: "Mon, 8:03 AM",
    },
];

const alerts: AlertItem[] = [
    {
        id: "ALT-221",
        title: "Unauthorized access attempt",
        description: "Badge scanner denied entry three times at the same door.",
        area: "Server Room B",
        level: "Critical",
        time: "6 min ago",
        unread: true,
    },
    {
        id: "ALT-220",
        title: "Perimeter camera offline",
        description: "North perimeter camera feed has been unresponsive.",
        area: "North Fence Line",
        level: "Warning",
        time: "34 min ago",
        unread: true,
    },
    {
        id: "ALT-219",
        title: "Shift handover completed",
        description: "Evening patrol shift has been handed over successfully.",
        area: "Security Office",
        level: "Info",
        time: "1 hr ago",
    },
];

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const priorityStyles: Record<Announcement["priority"], string> = {
    Important: "bg-amber-50 text-amber-800 ring-amber-100",
    Normal: "bg-slate-50 text-slate-500 ring-slate-200",
};

const alertStyles: Record<AlertItem["level"], string> = {
    Critical: "bg-red-50 text-red-600 ring-red-100",
    Warning: "bg-amber-50 text-amber-700 ring-amber-100",
    Info: "bg-blue-50 text-blue-600 ring-blue-100",
};

const alertIcon: Record<AlertItem["level"], typeof Siren> = {
    Critical: Siren,
    Warning: AlertTriangle,
    Info: Info,
};

export default function StaffDashboard() {
    const { user } = useAuth();

    const unreadAlerts = alerts.filter((alert) => alert.unread).length;
    const firstName = user?.first_name || "there";

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
                        <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                            3.11
                        </span>
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
                                    key={item.id}
                                    className="px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        {item.pinned && (
                                            <Pin className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                        )}
                                        <h3 className="text-[13px] font-semibold text-slate-900">
                                            {item.title}
                                        </h3>
                                        <span
                                            className={`${chip} ${priorityStyles[item.priority]}`}
                                        >
                                            {item.priority}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                                        {item.message}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                                        <span>{item.postedBy}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-3 w-3" />
                                            {item.postedAt}
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
                        <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                            3.12
                        </span>
                    </div>

                    <div className="space-y-2 p-3">
                        {alerts.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="No alerts right now"
                                description="Security alerts and system notifications will show up here."
                            />
                        ) : (
                            alerts.map((alert) => {
                                const Icon = alertIcon[alert.level];

                                return (
                                    <div
                                        key={alert.id}
                                        className="rounded-xl bg-white/70 p-3.5 ring-1 ring-slate-200 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${alertStyles[alert.level]}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[12.5px] font-semibold text-slate-900">
                                                        {alert.title}
                                                    </h3>
                                                    {alert.unread && (
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                                    {alert.description}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {alert.area}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span>{alert.time}</span>
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
