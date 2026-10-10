import type { Incident } from "@/store/useIncidentReportStore";

/**
 * Incident statuses in workflow order, with the chart color and a plain
 * description of each stage. Shared by the summary chart and status guide.
 */
export const INCIDENT_STATUSES: {
    key: Incident["status"];
    color: string;
    description: string;
}[] = [
    {
        key: "Pending",
        color: "#d97706",
        description: "Report submitted and awaiting assignment by an administrator.",
    },
    {
        key: "In Progress",
        color: "#2563eb",
        description: "Assigned to security personnel who are responding to it.",
    },
    {
        key: "Resolved",
        color: "#059669",
        description: "The issue has been handled and the resolution recorded.",
    },
    {
        key: "Closed",
        color: "#e87ba4",
        description: "Reviewed and finalized. The report can no longer be changed.",
    },
];
