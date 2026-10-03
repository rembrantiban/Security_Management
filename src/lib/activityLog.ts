import {
    History,
    LogIn,
    LogOut,
    UserPlus,
    IdCard,
    ShieldCheck,
    CalendarClock,
    Route,
    TriangleAlert,
    type LucideIcon,
} from "lucide-react";
import type { ActivityLog, ActivityAction } from "@/store/useActivityStore";

/**
 * Presentation helpers for activity-log entries, shared by the dashboard
 * timeline and the full Activity Logs modal.
 */

export const actionConfig: Record<
    ActivityAction,
    { icon: LucideIcon; tile: string; chip: string }
> = {
    Login: {
        icon: LogIn,
        tile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    Logout: {
        icon: LogOut,
        tile: "bg-slate-50 text-slate-500 ring-slate-200",
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
    },
    Register: {
        icon: UserPlus,
        tile: "bg-sky-50 text-sky-600 ring-sky-100",
        chip: "bg-sky-50 text-sky-700 ring-sky-100",
    },
    "Incident Report": {
        icon: TriangleAlert,
        tile: "bg-red-50 text-red-600 ring-red-100",
        chip: "bg-red-50 text-red-700 ring-red-100",
    },
    "Visitor Request": {
        icon: IdCard,
        tile: "bg-amber-50 text-amber-700 ring-amber-100",
        chip: "bg-amber-50 text-amber-800 ring-amber-100",
    },
    "Access Request": {
        icon: ShieldCheck,
        tile: "bg-violet-50 text-violet-600 ring-violet-100",
        chip: "bg-violet-50 text-violet-700 ring-violet-100",
    },
    Monitoring: {
        icon: CalendarClock,
        tile: "bg-indigo-50 text-indigo-600 ring-indigo-100",
        chip: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
    Patrol: {
        icon: Route,
        tile: "bg-teal-50 text-teal-600 ring-teal-100",
        chip: "bg-teal-50 text-teal-700 ring-teal-100",
    },
};

export const fallbackConfig = {
    icon: History,
    tile: "bg-slate-50 text-slate-500 ring-slate-200",
    chip: "bg-slate-50 text-slate-500 ring-slate-200",
};

/**
 * Human-readable predicate for a log entry — the part that follows the actor,
 * e.g. "logged in", "reported incident #INC-2026-0001".
 *
 * `detail` carries a ready-made predicate for the multi-variant actions
 * (Monitoring / Patrol / Access Request); the simpler actions are phrased here.
 */
export function describeActivity(log: ActivityLog): string {
    const ref = log.reference ? `#${log.reference}` : "";

    switch (log.action) {
        case "Login":
            return "logged in";
        case "Logout":
            return "logged out";
        case "Register":
            return log.detail
                ? `registered a new ${log.detail}`
                : "registered a new account";
        case "Incident Report":
            return (
                `reported incident ${ref}`.trim() +
                (log.detail ? ` — ${log.detail}` : "")
            );
        case "Visitor Request":
            return (
                `submitted access request ${ref}`.trim() +
                (log.detail ? ` for ${log.detail}` : "")
            );
        case "Access Request":
            return `${log.detail ?? "updated"} access request ${ref}`.trim();
        case "Monitoring":
        case "Patrol":
            return log.detail ?? log.action.toLowerCase();
        default:
            return log.detail ?? log.action;
    }
}

/** Full sentence for a log entry, e.g. "John Doe logged in". */
export function activitySentence(log: ActivityLog): string {
    return `${log.user_name} ${describeActivity(log)}`;
}

export function formatDateTime(value: string): string {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}
