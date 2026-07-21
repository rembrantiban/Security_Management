import { useEffect } from "react";
import {
    AlertTriangle,
    Clock,
    MapPin,
    ShieldAlert,
    Siren,
    Tag,
    UserCheck,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { Incident } from "@/store/useIncidentReportStore";

interface ViewFullReportProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: Incident | null;
}

const severityConfig = {
    Critical: { icon: Siren, className: "bg-red-50 text-red-700 border-red-200" },
    High: { icon: ShieldAlert, className: "bg-orange-50 text-orange-700 border-orange-200" },
    Medium: { icon: AlertTriangle, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    Low: { icon: AlertTriangle, className: "bg-slate-100 text-slate-700 border-slate-200" },
};

const statusConfig = {
    Pending: "bg-red-50 text-red-700 border-red-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-100 text-slate-700 border-slate-200",
};

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");
}

function formatTimestamp(value: string) {
    const date = new Date(value);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function ViewFullReport({
    open,
    onOpenChange,
    incident,
}: ViewFullReportProps) {

    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    if (!open || !incident) return null;

    const SeverityIcon = severityConfig[incident.severity].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
                    <h2 className="text-base font-semibold text-slate-900">
                        Incident Report
                    </h2>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4.5 w-4.5" />
                    </Button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto">

                    <div className="p-4">

                        {/* Reporter row */}
                        <div className="flex items-start gap-3">

                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">
                                    {getInitials(incident.reported_by_name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">

                                <p className="font-semibold text-slate-900">
                                    {incident.reported_by_name}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimestamp(incident.created_at)}</span>
                                    <span>·</span>
                                    <span className="truncate">{incident.incident_number}</span>
                                </div>

                            </div>

                        </div>

                        {/* Status + severity badges */}
                        <div className="mt-3 flex flex-wrap gap-2">

                            <Badge
                                className={`rounded-full border px-3 py-0.5 text-xs font-medium ${statusConfig[incident.status]}`}
                            >
                                {incident.status}
                            </Badge>

                            <Badge
                                className={`rounded-full border px-3 py-0.5 text-xs font-medium ${severityConfig[incident.severity].className}`}
                            >
                                <SeverityIcon className="mr-1 h-3 w-3" />
                                {incident.severity}
                            </Badge>

                        </div>

                        {/* Title + description, like a post body */}
                        <div className="mt-3">

                            <p className="font-semibold text-slate-900">
                                {incident.title}
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                {incident.description}
                            </p>

                        </div>

                    </div>

                    {/* Image evidence */}
                    {incident.incident_image && (
                        <div className="bg-slate-100">
                            <img
                                src={incident.incident_image}
                                alt="Incident evidence"
                                className="max-h-105 w-full object-contain"
                            />
                        </div>
                    )}

                    {/* Meta details, like a post footer */}
                    <div className="space-y-2.5 border-t border-slate-100 p-4 text-sm">

                        <div className="flex items-center gap-2.5 text-slate-600">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{incident.location}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-slate-600">
                            <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{incident.category}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-slate-600">
                            <UserCheck className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>
                                {incident.assigned_to_name
                                    ? `Assigned to ${incident.assigned_to_name}`
                                    : "Not assigned"}
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}