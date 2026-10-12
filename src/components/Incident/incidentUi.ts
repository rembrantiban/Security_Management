import { AlertTriangle, ShieldAlert, Siren, type LucideIcon } from "lucide-react";
import type { Incident } from "@/store/useIncidentReportStore";

type Severity = Incident["severity"];
type Status = Incident["status"];

/** Shared chip base for severity / status pills. */
export const INCIDENT_CHIP =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

export const SEVERITY_CONFIG: Record<
    Severity,
    { icon: LucideIcon; chip: string; tile: string; dot: string; accent: string; rank: number }
> = {
    Critical: {
        icon: Siren,
        chip: "bg-red-50 text-red-700 ring-red-100",
        tile: "bg-red-50 text-red-600 ring-red-100",
        dot: "bg-red-500",
        accent: "before:bg-red-500",
        rank: 0,
    },
    High: {
        icon: ShieldAlert,
        chip: "bg-orange-50 text-orange-700 ring-orange-100",
        tile: "bg-orange-50 text-orange-600 ring-orange-100",
        dot: "bg-orange-500",
        accent: "before:bg-orange-500",
        rank: 1,
    },
    Medium: {
        icon: AlertTriangle,
        chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        tile: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
        accent: "before:bg-yellow-400",
        rank: 2,
    },
    Low: {
        icon: AlertTriangle,
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
        tile: "bg-slate-50 text-slate-400 ring-slate-200",
        dot: "bg-slate-300",
        accent: "before:bg-slate-300",
        rank: 3,
    },
};

export const STATUS_CHIP: Record<Status, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-100",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-100",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const isIncidentOpen = (status: Status) =>
    status === "Pending" || status === "In Progress";

export const formatIncidentDateTime = (value: string) =>
    new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

/** Compact relative time ("just now", "5m ago", "3h ago", "2d ago", then a date). */
export function incidentTimeAgo(value: string): string {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60_000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
