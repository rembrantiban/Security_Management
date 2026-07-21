import { useMemo, useState } from "react";
import {
    Siren,
    Clock,
    Loader2,
    CheckCircle2,
    ChevronRight,
    MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Incident {
    incident_id: number;
    incident_number: string;
    title: string;
    category: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    location: string;
    description: string;
    incident_image: string | null;
    status: "Pending" | "In Progress" | "Resolved" | "Closed";
    reported_by: string;
    reported_by_name: string;
    assigned_to: string | null;
    assigned_to_name: string | null;
    created_at: string;
    updated_at: string;
}

// TODO: replace with a real data hook, e.g. `const { incidents, isLoading } = useIncidentReport();`
const MOCK_INCIDENTS: Incident[] = [
    { incident_id: 1, incident_number: "INC-2026-0231", title: "Unauthorized entry at back gate", category: "Security Breach", severity: "Critical", location: "Back Gate", description: "", incident_image: null, status: "Pending", reported_by: "u4", reported_by_name: "Officer J. Ramos", assigned_to: null, assigned_to_name: null, created_at: "2026-07-04T07:20:00", updated_at: "2026-07-04T07:20:00" },
    { incident_id: 2, incident_number: "INC-2026-0230", title: "Fire alarm triggered, Building B", category: "Fire & Safety", severity: "High", location: "Building B", description: "", incident_image: null, status: "In Progress", reported_by: "u3", reported_by_name: "Officer M. Bautista", assigned_to: "u2", assigned_to_name: "Officer L. Diaz", created_at: "2026-07-04T05:45:00", updated_at: "2026-07-04T06:10:00" },
    { incident_id: 3, incident_number: "INC-2026-0229", title: "Vandalism on library wall", category: "Property Damage", severity: "Medium", location: "Library", description: "", incident_image: null, status: "In Progress", reported_by: "u4", reported_by_name: "Officer J. Ramos", assigned_to: "u2", assigned_to_name: "Officer L. Diaz", created_at: "2026-07-03T16:30:00", updated_at: "2026-07-03T17:00:00" },
    { incident_id: 4, incident_number: "INC-2026-0228", title: "Suspicious vehicle near parking lot", category: "Security Breach", severity: "High", location: "Main Parking Lot", description: "", incident_image: null, status: "Resolved", reported_by: "u3", reported_by_name: "Officer M. Bautista", assigned_to: "u3", assigned_to_name: "Officer M. Bautista", created_at: "2026-07-03T09:12:00", updated_at: "2026-07-03T10:05:00" },
    { incident_id: 5, incident_number: "INC-2026-0227", title: "Slippery floor reported, Cafeteria", category: "Safety Hazard", severity: "Low", location: "Cafeteria", description: "", incident_image: null, status: "Resolved", reported_by: "u4", reported_by_name: "Officer J. Ramos", assigned_to: "u4", assigned_to_name: "Officer J. Ramos", created_at: "2026-07-02T12:40:00", updated_at: "2026-07-02T13:00:00" },
    { incident_id: 6, incident_number: "INC-2026-0226", title: "Lost student ID reported at gate", category: "Lost & Found", severity: "Low", location: "Main Gate", description: "", incident_image: null, status: "Closed", reported_by: "u2", reported_by_name: "Officer L. Diaz", assigned_to: "u2", assigned_to_name: "Officer L. Diaz", created_at: "2026-07-02T08:15:00", updated_at: "2026-07-02T08:30:00" },
    { incident_id: 7, incident_number: "INC-2026-0225", title: "Altercation between students", category: "Disturbance", severity: "Medium", location: "Quadrangle", description: "", incident_image: null, status: "Resolved", reported_by: "u3", reported_by_name: "Officer M. Bautista", assigned_to: "u3", assigned_to_name: "Officer M. Bautista", created_at: "2026-07-01T14:20:00", updated_at: "2026-07-01T15:00:00" },
    { incident_id: 8, incident_number: "INC-2026-0224", title: "Power outage in Gymnasium", category: "Facilities", severity: "Medium", location: "Gymnasium", description: "", incident_image: null, status: "Closed", reported_by: "u4", reported_by_name: "Officer J. Ramos", assigned_to: "u4", assigned_to_name: "Officer J. Ramos", created_at: "2026-06-30T18:00:00", updated_at: "2026-06-30T19:10:00" },
    { incident_id: 9, incident_number: "INC-2026-0223", title: "Theft reported in dormitory", category: "Security Breach", severity: "Critical", location: "Dormitory Block C", description: "", incident_image: null, status: "Resolved", reported_by: "u2", reported_by_name: "Officer L. Diaz", assigned_to: "u2", assigned_to_name: "Officer L. Diaz", created_at: "2026-06-29T22:30:00", updated_at: "2026-06-30T08:00:00" },
    { incident_id: 10, incident_number: "INC-2026-0222", title: "Unattended bag near admin office", category: "Safety Hazard", severity: "High", location: "Admin Building", description: "", incident_image: null, status: "Closed", reported_by: "u3", reported_by_name: "Officer M. Bautista", assigned_to: "u3", assigned_to_name: "Officer M. Bautista", created_at: "2026-06-28T11:05:00", updated_at: "2026-06-28T11:40:00" },
];

const statusConfig = {
    Pending: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    "In Progress": { className: "bg-blue-50 text-blue-700 border-blue-200", icon: Loader2 },
    Resolved: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    Closed: { className: "bg-slate-100 text-slate-600 border-slate-200", icon: CheckCircle2 },
};

const severityConfig: Record<Incident["severity"], { badge: string; dot: string; icon: string }> = {
    Critical: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", icon: "bg-red-50 text-red-600" },
    High: { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", icon: "bg-orange-50 text-orange-600" },
    Medium: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", icon: "bg-yellow-50 text-yellow-600" },
    Low: { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", icon: "bg-slate-100 text-slate-500" },
};

function timeAgo(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function IncidentSummaryDashboard() {
    const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);

    const recent = useMemo(
        () =>
            [...incidents]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5),
        [incidents]
    );

    return (
        <div className="space-y-5">

            {/* Recent incidents */}
            <Card className="overflow-hidden rounded border-slate-200 shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Recent Incidents</p>
                        <p className="text-xs text-slate-400">Latest reports across all locations</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-lg text-xs font-medium text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                    >
                        View all
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {recent.map((inc) => {
                            const StatusIcon = statusConfig[inc.status].icon;
                            const sev = severityConfig[inc.severity];

                            return (
                                <div
                                    key={inc.incident_id}
                                    className="group relative flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-slate-50/70"
                                >
                                    {/* Severity accent bar */}
                                    <span className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full ${sev.dot}`} />

                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sev.icon}`}>
                                        <Siren className="h-4.5 w-4.5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">
                                            {inc.title}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-400">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{inc.location}</span>
                                            <span>·</span>
                                            <span>{timeAgo(inc.created_at)}</span>
                                        </div>
                                    </div>

                                    <Badge className={`hidden shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${sev.badge}`}>
                                        {inc.severity}
                                    </Badge>

                                    <Badge className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig[inc.status].className}`}>
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {inc.status}
                                    </Badge>
                                </div>
                            );
                        })}

                        {recent.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No recent incidents.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}