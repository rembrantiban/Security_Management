import type { Incident } from "@/store/useIncidentReportStore";
import type { PatrolLog } from "@/store/usePatrolStore";
import type { RequestAccess } from "@/store/useRequestStore";
import {
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";
import { patrolDurationMinutes } from "./patrolReport";
import {
    EXCLUDED_ROLES,
    makeRoleResolver,
    type DirectoryUser,
} from "./userActivityReport";

/**
 * Security Performance Report — data + spreadsheet export.
 *
 * A management-level view of how the security operation is performing over the
 * reporting period. It measures three things:
 *
 *   1. Incident response  — resolution rate and time-to-resolve
 *   2. Patrol operations  — completion rate and time on patrol
 *   3. Access control      — visitor request decision rate and turnaround
 *
 * plus a per-person "Personnel Effectiveness" breakdown for field staff.
 *
 * Every metric is derived from the operational source tables (incidents, patrol
 * logs, access requests) rather than the generic activity log, so the numbers
 * match the individual operational reports exactly. Administrator accounts are
 * out of scope for the personnel breakdown.
 */

export type { ReportMeta };

export type SecurityPerformanceSources = {
    incidents: Incident[];
    patrolLogs: PatrolLog[];
    requests: RequestAccess[];
    users: DirectoryUser[];
};

/** One field-staff member's contribution over the period. */
export type PersonnelPerformanceRow = {
    userName: string;
    role: string;
    incidentsAssigned: number;
    incidentsResolved: number;
    incidentResolutionRate: number | null;
    avgResolutionMs: number | null;
    patrolsAssigned: number;
    patrolsCompleted: number;
    patrolCompletionRate: number | null;
    requestsProcessed: number;
    /** 0–100 blend of the rates that apply to this person; null when idle. */
    effectiveness: number | null;
};

export type SecurityPerformanceSummary = {
    // Incident response
    incidentsTotal: number;
    incidentsResolved: number;
    incidentResolutionRate: number | null;
    avgIncidentResolutionMs: number | null;
    criticalHighTotal: number;
    criticalHighResolved: number;
    criticalHighResolutionRate: number | null;
    openIncidents: number;

    // Patrol operations
    patrolsScheduled: number;
    patrolsCompleted: number;
    patrolCompletionRate: number | null;
    avgPatrolMinutes: number | null;
    missedPatrols: number;

    // Access control
    requestsTotal: number;
    requestsDecided: number;
    requestsApproved: number;
    requestApprovalRate: number | null;
    avgRequestDecisionMs: number | null;
    pendingRequests: number;

    // People / coverage
    personnelEvaluated: number;
    firstActivity: string | null;
    lastActivity: string | null;

    /** Total operational records analysed — used by the Reports Center UI. */
    total: number;
};

export type SecurityPerformanceReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    personnel: PersonnelPerformanceRow[];
    summary: SecurityPerformanceSummary;
};

const RESOLVED_INCIDENT_STATUSES = new Set(["Resolved", "Closed"]);
const OPEN_INCIDENT_STATUSES = new Set(["Pending", "In Progress"]);
const DECIDED_REQUEST_STATUSES = new Set(["Approved", "Rejected"]);

const pad = (n: number) => String(n).padStart(2, "0");

function makeReference(d: Date): string {
    return `SP-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

/** Whole-number percentage of `part` over `whole`; null when there is nothing to divide. */
export function rate(part: number, whole: number): number | null {
    if (whole <= 0) return null;
    return Math.round((part / whole) * 100);
}

/** "45m" · "2h 15m" · "1d 4h" — compact elapsed-time label. */
export function formatElapsed(ms: number | null): string {
    if (ms == null || Number.isNaN(ms) || ms < 0) return "—";

    const totalMinutes = Math.round(ms / 60000);
    if (totalMinutes < 60) return `${totalMinutes}m`;

    const totalHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (totalHours < 24) {
        return minutes ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
    }

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return hours ? `${days}d ${hours}h` : `${days}d`;
}

export function formatRate(value: number | null): string {
    return value == null ? "—" : `${value}%`;
}

function mean(values: number[]): number | null {
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function elapsedMs(startIso: string, endIso: string): number | null {
    const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
    return Number.isNaN(ms) || ms < 0 ? null : ms;
}

type PersonnelAccumulator = {
    userName: string;
    role: string;
    incidentsAssigned: number;
    incidentsResolved: number;
    resolutionDurations: number[];
    patrolsAssigned: number;
    patrolsCompleted: number;
    requestsProcessed: number;
};

function seedPerson(userName: string, role: string): PersonnelAccumulator {
    return {
        userName,
        role,
        incidentsAssigned: 0,
        incidentsResolved: 0,
        resolutionDurations: [],
        patrolsAssigned: 0,
        patrolsCompleted: 0,
        requestsProcessed: 0,
    };
}

/** Blend of the rates that apply to a person; null when they had no assignments. */
function effectivenessScore(
    incidentRate: number | null,
    patrolRate: number | null
): number | null {
    const parts = [incidentRate, patrolRate].filter(
        (n): n is number => n != null
    );
    if (!parts.length) return null;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function buildSecurityPerformanceReport(
    sources: SecurityPerformanceSources,
    meta: ReportMeta
): SecurityPerformanceReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const inRange = (iso: string | null | undefined): boolean => {
        if (!iso) return false;
        const t = new Date(iso).getTime();
        if (Number.isNaN(t)) return false;
        if (from && t < from.getTime()) return false;
        if (to && t > to.getTime()) return false;
        return true;
    };

    const resolveRole = makeRoleResolver(sources.users);

    /* ---- Filter each source to the reporting period ---- */

    const incidents = sources.incidents.filter((i) => inRange(i.created_at));
    const patrols = sources.patrolLogs.filter((p) => inRange(p.schedule_date));
    const requests = sources.requests.filter((r) => inRange(r.created_at));

    /* ---- Incident response ---- */

    const incidentsResolvedRows = incidents.filter((i) =>
        RESOLVED_INCIDENT_STATUSES.has(i.status)
    );
    const incidentResolutionDurations = incidentsResolvedRows
        .map((i) => elapsedMs(i.created_at, i.updated_at))
        .filter((ms): ms is number => ms != null);

    const criticalHigh = incidents.filter(
        (i) => i.severity === "Critical" || i.severity === "High"
    );
    const criticalHighResolved = criticalHigh.filter((i) =>
        RESOLVED_INCIDENT_STATUSES.has(i.status)
    );

    /* ---- Patrol operations ---- */

    const patrolsCompleted = patrols.filter((p) => p.status === "Completed");
    const patrolDurations = patrolsCompleted
        .map(patrolDurationMinutes)
        .filter((m): m is number => m != null);

    /* ---- Access control ---- */

    const requestsDecided = requests.filter((r) =>
        DECIDED_REQUEST_STATUSES.has(r.status)
    );
    const requestsApproved = requests.filter((r) => r.status === "Approved");
    const requestDecisionDurations = requestsDecided
        .map((r) =>
            r.approved_at ? elapsedMs(r.created_at, r.approved_at) : null
        )
        .filter((ms): ms is number => ms != null);

    /* ---- Personnel effectiveness (field staff only) ---- */

    const people = new Map<string, PersonnelAccumulator>();

    const personKey = (name: string | null | undefined) =>
        (name ?? "").trim().toLowerCase();

    const ensurePerson = (
        name: string | null | undefined,
        role: string | null
    ): PersonnelAccumulator | null => {
        const cleanName = (name ?? "").trim();
        if (!cleanName || !role || EXCLUDED_ROLES.has(role)) return null;

        const key = personKey(cleanName);
        let acc = people.get(key);
        if (!acc) {
            acc = seedPerson(cleanName, role);
            people.set(key, acc);
        }
        return acc;
    };

    for (const incident of incidents) {
        if (!incident.assigned_to_name) continue;
        const role = resolveRole(
            incident.assigned_to,
            incident.assigned_to_name
        );
        const acc = ensurePerson(incident.assigned_to_name, role);
        if (!acc) continue;

        acc.incidentsAssigned += 1;
        if (RESOLVED_INCIDENT_STATUSES.has(incident.status)) {
            acc.incidentsResolved += 1;
            const ms = elapsedMs(incident.created_at, incident.updated_at);
            if (ms != null) acc.resolutionDurations.push(ms);
        }
    }

    for (const patrol of patrols) {
        const role =
            resolveRole(patrol.user_id, patrol.personnel_name) ??
            "Security Personnel";
        const acc = ensurePerson(patrol.personnel_name, role);
        if (!acc) continue;

        acc.patrolsAssigned += 1;
        if (patrol.status === "Completed") acc.patrolsCompleted += 1;
    }

    for (const request of requestsDecided) {
        if (!request.approved_by_name) continue;
        const role = resolveRole(
            request.approved_by,
            request.approved_by_name
        );
        const acc = ensurePerson(request.approved_by_name, role);
        if (!acc) continue;

        acc.requestsProcessed += 1;
    }

    const personnel: PersonnelPerformanceRow[] = [...people.values()]
        .map((acc) => {
            const incidentResolutionRate = acc.incidentsAssigned
                ? rate(acc.incidentsResolved, acc.incidentsAssigned)
                : null;
            const patrolCompletionRate = acc.patrolsAssigned
                ? rate(acc.patrolsCompleted, acc.patrolsAssigned)
                : null;

            return {
                userName: acc.userName,
                role: acc.role,
                incidentsAssigned: acc.incidentsAssigned,
                incidentsResolved: acc.incidentsResolved,
                incidentResolutionRate,
                avgResolutionMs: mean(acc.resolutionDurations),
                patrolsAssigned: acc.patrolsAssigned,
                patrolsCompleted: acc.patrolsCompleted,
                patrolCompletionRate,
                requestsProcessed: acc.requestsProcessed,
                effectiveness: effectivenessScore(
                    incidentResolutionRate,
                    patrolCompletionRate
                ),
            };
        })
        .sort((a, b) => {
            const ae = a.effectiveness ?? -1;
            const be = b.effectiveness ?? -1;
            if (be !== ae) return be - ae;
            return a.userName.localeCompare(b.userName);
        });

    /* ---- Period bounds across every source event ---- */

    const activityTimes = [
        ...incidents.map((i) => i.created_at),
        ...patrols.map((p) => p.schedule_date),
        ...requests.map((r) => r.created_at),
    ]
        .map((iso) => new Date(iso).getTime())
        .filter((t) => !Number.isNaN(t));

    const summary: SecurityPerformanceSummary = {
        incidentsTotal: incidents.length,
        incidentsResolved: incidentsResolvedRows.length,
        incidentResolutionRate: rate(
            incidentsResolvedRows.length,
            incidents.length
        ),
        avgIncidentResolutionMs: mean(incidentResolutionDurations),
        criticalHighTotal: criticalHigh.length,
        criticalHighResolved: criticalHighResolved.length,
        criticalHighResolutionRate: rate(
            criticalHighResolved.length,
            criticalHigh.length
        ),
        openIncidents: incidents.filter((i) =>
            OPEN_INCIDENT_STATUSES.has(i.status)
        ).length,

        patrolsScheduled: patrols.length,
        patrolsCompleted: patrolsCompleted.length,
        patrolCompletionRate: rate(patrolsCompleted.length, patrols.length),
        avgPatrolMinutes:
            patrolDurations.length
                ? Math.round(
                      patrolDurations.reduce((a, b) => a + b, 0) /
                          patrolDurations.length
                  )
                : null,
        missedPatrols: patrols.filter((p) => p.status === "Missed").length,

        requestsTotal: requests.length,
        requestsDecided: requestsDecided.length,
        requestsApproved: requestsApproved.length,
        requestApprovalRate: rate(
            requestsApproved.length,
            requestsDecided.length
        ),
        avgRequestDecisionMs: mean(requestDecisionDurations),
        pendingRequests: requests.filter((r) => r.status === "Pending").length,

        personnelEvaluated: personnel.length,
        firstActivity: activityTimes.length
            ? new Date(Math.min(...activityTimes)).toISOString()
            : null,
        lastActivity: activityTimes.length
            ? new Date(Math.max(...activityTimes)).toISOString()
            : null,

        total: incidents.length + patrols.length + requestsDecided.length,
    };

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        personnel,
        summary,
    };
}

/* ------------------------------------------------------------------ */
/* Excel (.xls)                                                       */
/* ------------------------------------------------------------------ */

function esc(v: unknown): string {
    return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function fileBase(model: SecurityPerformanceReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `Security-Performance-Report_${f}_${t}`;
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSecurityPerformanceReportExcel(
    model: SecurityPerformanceReportModel
): void {
    const { meta, summary, personnel, generatedAt, reference } = model;

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">SECURITY PERFORMANCE REPORT</td></tr>
      <tr><td style="font-weight:bold;width:170px">Report No.</td><td>${esc(
          reference
      )}</td></tr>
      <tr><td style="font-weight:bold">Coverage</td><td>${esc(
          rangeLabel(meta)
      )}</td></tr>
      <tr><td style="font-weight:bold">Date Generated</td><td>${esc(
          fmtDateTime(generatedAt)
      )}</td></tr>
      <tr><td style="font-weight:bold">Prepared By</td><td>${esc(
          meta.generatedBy || "Security Administrator"
      )}</td></tr>
      <tr><td style="font-weight:bold">Records Analysed</td><td>${
          summary.total
      }</td></tr>
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
      <tr><td colspan="2" style="font-size:12px;font-weight:bold">INCIDENT RESPONSE</td></tr>
      <tr><td style="font-weight:bold">Incidents Logged</td><td>${
          summary.incidentsTotal
      }</td></tr>
      <tr><td style="font-weight:bold">Resolved / Closed</td><td>${
          summary.incidentsResolved
      }</td></tr>
      <tr><td style="font-weight:bold">Resolution Rate</td><td>${formatRate(
          summary.incidentResolutionRate
      )}</td></tr>
      <tr><td style="font-weight:bold">Avg. Time to Resolve</td><td>${formatElapsed(
          summary.avgIncidentResolutionMs
      )}</td></tr>
      <tr><td style="font-weight:bold">Critical / High Logged</td><td>${
          summary.criticalHighTotal
      }</td></tr>
      <tr><td style="font-weight:bold">Critical / High Resolution Rate</td><td>${formatRate(
          summary.criticalHighResolutionRate
      )}</td></tr>
      <tr><td style="font-weight:bold">Still Open</td><td>${
          summary.openIncidents
      }</td></tr>
      <tr><td></td></tr>
      <tr><td colspan="2" style="font-size:12px;font-weight:bold">PATROL OPERATIONS</td></tr>
      <tr><td style="font-weight:bold">Patrols Scheduled</td><td>${
          summary.patrolsScheduled
      }</td></tr>
      <tr><td style="font-weight:bold">Patrols Completed</td><td>${
          summary.patrolsCompleted
      }</td></tr>
      <tr><td style="font-weight:bold">Completion Rate</td><td>${formatRate(
          summary.patrolCompletionRate
      )}</td></tr>
      <tr><td style="font-weight:bold">Avg. Duration</td><td>${
          summary.avgPatrolMinutes != null
              ? `${summary.avgPatrolMinutes} min`
              : "—"
      }</td></tr>
      <tr><td style="font-weight:bold">Missed Patrols</td><td>${
          summary.missedPatrols
      }</td></tr>
      <tr><td></td></tr>
      <tr><td colspan="2" style="font-size:12px;font-weight:bold">ACCESS CONTROL</td></tr>
      <tr><td style="font-weight:bold">Requests Received</td><td>${
          summary.requestsTotal
      }</td></tr>
      <tr><td style="font-weight:bold">Decisions Made</td><td>${
          summary.requestsDecided
      }</td></tr>
      <tr><td style="font-weight:bold">Approval Rate</td><td>${formatRate(
          summary.requestApprovalRate
      )}</td></tr>
      <tr><td style="font-weight:bold">Avg. Decision Turnaround</td><td>${formatElapsed(
          summary.avgRequestDecisionMs
      )}</td></tr>
      <tr><td style="font-weight:bold">Pending Decision</td><td>${
          summary.pendingRequests
      }</td></tr>
      <tr><td></td></tr>
    `;

    const headers = [
        "#",
        "Personnel",
        "Role",
        "Incidents Assigned",
        "Incidents Resolved",
        "Resolution Rate",
        "Avg. Resolve Time",
        "Patrols Assigned",
        "Patrols Completed",
        "Patrol Completion",
        "Requests Processed",
        "Effectiveness",
    ];

    const th = headers
        .map(
            (h) =>
                `<th style="background:#1a1a1a;color:#ffffff;font-weight:bold;text-align:left;border:1px solid #000;padding:5px 9px">${esc(
                    h
                )}</th>`
        )
        .join("");

    const body =
        personnel
            .map((p, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;
                return `<tr>${[
                    i + 1,
                    p.userName,
                    p.role,
                    p.incidentsAssigned,
                    p.incidentsResolved,
                    formatRate(p.incidentResolutionRate),
                    formatElapsed(p.avgResolutionMs),
                    p.patrolsAssigned,
                    p.patrolsCompleted,
                    formatRate(p.patrolCompletionRate),
                    p.requestsProcessed,
                    p.effectiveness == null ? "—" : `${p.effectiveness}%`,
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No personnel activity within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Security Performance Report</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
<table>${metaRows}</table>
<table border="1"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
</body>
</html>`;

    const blob = new Blob(["﻿", doc], {
        type: "application/vnd.ms-excel;charset=utf-8",
    });

    triggerDownload(blob, `${fileBase(model)}.xls`);
}
