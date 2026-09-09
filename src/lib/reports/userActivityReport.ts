import type { RequestAccess } from "@/store/useRequestStore";
import type { PatrolLog } from "@/store/usePatrolStore";
import type { Incident } from "@/store/useIncidentReportStore";
import {
    fmtDate,
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";

/**
 * User Activity Report — data + spreadsheet export.
 *
 * An operational activity log for Security Personnel and Authorized Staff. It
 * records the work they perform — visitor access requests processed, patrol
 * rounds completed, and incident reports filed. Session logins/logouts are
 * intentionally excluded.
 *
 * Every event is read from its own source of truth (access requests, patrol
 * logs, incidents) rather than the generic `activity_logs` table, so a request
 * raised by an administrator is still counted. Events are filtered to the
 * reporting period and listed newest-first.
 */

export type { ReportMeta };

export type ActivityKind = "Visitor Request" | "Patrol" | "Incident Report";

/** A single normalised activity event, regardless of its source table. */
export type UserActivityRow = {
    id: string;
    kind: ActivityKind;
    occurredAt: string;
    userName: string;
    role: string | null;
    reference: string;
    detail: string;
};

/** Minimal user record used to resolve each actor's role. */
export type DirectoryUser = {
    user_id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    role: string;
};

export type UserActivitySources = {
    requests: RequestAccess[];
    patrolLogs: PatrolLog[];
    incidents: Incident[];
    users: DirectoryUser[];
};

/** Resolves an actor's role by user id, falling back to a full-name match. */
function makeRoleResolver(users: DirectoryUser[]) {
    const byId = new Map<number, string>();
    const byName = new Map<string, string>();

    for (const u of users) {
        byId.set(u.user_id, u.role);
        const names = [
            [u.first_name, u.last_name],
            [u.first_name, u.middle_name, u.last_name],
        ];
        for (const parts of names) {
            const key = parts.filter(Boolean).join(" ").trim().toLowerCase();
            if (key) byName.set(key, u.role);
        }
    }

    return (
        id: number | string | null | undefined,
        name: string | null | undefined
    ): string | null => {
        const numericId = typeof id === "string" ? Number(id) : id;
        if (numericId != null && !Number.isNaN(numericId) && byId.has(numericId)) {
            return byId.get(numericId) ?? null;
        }
        if (name) {
            const hit = byName.get(name.trim().toLowerCase());
            if (hit) return hit;
        }
        return null;
    };
}

export type UserActivityReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: UserActivityRow[];
    summary: {
        total: number;
        requests: number;
        patrols: number;
        incidents: number;
        users: number;
        byKind: Record<ActivityKind, number>;
        firstEvent: string | null;
        lastEvent: string | null;
    };
};

export const ACTIVITY_KIND_ORDER: readonly ActivityKind[] = [
    "Visitor Request",
    "Patrol",
    "Incident Report",
];

/**
 * Administrator activity is out of scope — this report covers field staff only.
 * The user directory already excludes admin roles, so any actor that fails to
 * resolve to a role is treated as out of scope too; this set is a second guard
 * in case that ever changes.
 */
const EXCLUDED_ROLES = new Set(["Administrator", "IT System Administrator"]);

const pad = (n: number) => String(n).padStart(2, "0");

/** Combined "reference — detail" string for a row. */
export function activityDetail(row: UserActivityRow): string {
    if (row.reference && row.detail) return `${row.reference} — ${row.detail}`;
    return row.reference || row.detail || "—";
}

function makeReference(d: Date): string {
    return `UA-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

type RoleResolver = (
    id: number | string | null | undefined,
    name: string | null | undefined
) => string | null;

function fromRequest(
    request: RequestAccess,
    resolveRole: RoleResolver
): UserActivityRow {
    const visitor = [
        request.first_name,
        request.middle_name,
        request.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const detailParts = [
        `Visitor: ${visitor || "—"}`,
        `Status: ${request.status}`,
    ];
    if (request.purpose) detailParts.push(request.purpose);
    if (request.approved_by_name) {
        detailParts.push(`processed by ${request.approved_by_name}`);
    }

    // The request is the requester's activity — attribute (and role-check) it
    // to whoever filed it, not to whoever later approved it.
    return {
        id: `req-${request.request_id}`,
        kind: "Visitor Request",
        occurredAt: request.created_at,
        userName: request.requested_by_name,
        role: resolveRole(request.requested_by, request.requested_by_name),
        reference: request.request_number,
        detail: detailParts.join(" — "),
    };
}

function fromPatrolLog(
    patrol: PatrolLog,
    resolveRole: RoleResolver
): UserActivityRow {
    const occurredAt =
        patrol.patrol_end ?? patrol.patrol_start ?? patrol.created_at;

    const detailParts = [`Status: ${patrol.status}`];
    if (patrol.schedule_date) {
        detailParts.push(`scheduled ${fmtDate(patrol.schedule_date)}`);
    }
    if (patrol.observations) {
        detailParts.push(patrol.observations);
    }

    return {
        id: `pat-${patrol.patrol_log_id}`,
        kind: "Patrol",
        occurredAt,
        userName: patrol.personnel_name,
        role:
            resolveRole(patrol.user_id, patrol.personnel_name) ??
            "Security Personnel",
        reference: patrol.area_patrolled || "Patrol round",
        detail: detailParts.join(" — "),
    };
}

function fromIncident(
    incident: Incident,
    resolveRole: RoleResolver
): UserActivityRow {
    return {
        id: `inc-${incident.incident_id}`,
        kind: "Incident Report",
        occurredAt: incident.created_at,
        userName: incident.reported_by_name,
        role: resolveRole(incident.reported_by, incident.reported_by_name),
        reference: incident.incident_number,
        detail: [
            incident.title,
            incident.category,
            `Severity: ${incident.severity}`,
        ].join(" — "),
    };
}

export function buildUserActivityReport(
    sources: UserActivitySources,
    meta: ReportMeta
): UserActivityReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const inRange = (iso: string): boolean => {
        const t = new Date(iso).getTime();
        if (Number.isNaN(t)) return false;
        if (from && t < from.getTime()) return false;
        if (to && t > to.getTime()) return false;
        return true;
    };

    const resolveRole = makeRoleResolver(sources.users);

    const rows = [
        ...sources.requests.map((r) => fromRequest(r, resolveRole)),
        ...sources.patrolLogs.map((p) => fromPatrolLog(p, resolveRole)),
        ...sources.incidents.map((i) => fromIncident(i, resolveRole)),
    ]
        // Field staff only: keep rows whose actor resolved to a known,
        // non-administrator role.
        .filter((r) => !!r.role && !EXCLUDED_ROLES.has(r.role))
        .filter((r) => inRange(r.occurredAt))
        .sort(
            (a, b) =>
                new Date(b.occurredAt).getTime() -
                new Date(a.occurredAt).getTime()
        );

    const times = rows.map((r) => new Date(r.occurredAt).getTime());

    const byKind: Record<ActivityKind, number> = {
        "Visitor Request": 0,
        Patrol: 0,
        "Incident Report": 0,
    };
    for (const r of rows) byKind[r.kind] += 1;

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            requests: byKind["Visitor Request"],
            patrols: byKind.Patrol,
            incidents: byKind["Incident Report"],
            users: new Set(rows.map((r) => r.userName).filter(Boolean)).size,
            byKind,
            firstEvent: times.length
                ? new Date(Math.min(...times)).toISOString()
                : null,
            lastEvent: times.length
                ? new Date(Math.max(...times)).toISOString()
                : null,
        },
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

function fileBase(model: UserActivityReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `User-Activity-Report_${f}_${t}`;
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

export function downloadUserActivityReportExcel(
    model: UserActivityReportModel
): void {
    const { meta, summary, rows, generatedAt, reference } = model;

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">USER ACTIVITY REPORT</td></tr>
      <tr><td style="font-weight:bold;width:150px">Report No.</td><td>${esc(reference)}</td></tr>
      <tr><td style="font-weight:bold">Period Covered</td><td>${esc(
          rangeLabel(meta)
      )}</td></tr>
      <tr><td style="font-weight:bold">Date Generated</td><td>${esc(
          fmtDateTime(generatedAt)
      )}</td></tr>
      <tr><td style="font-weight:bold">Prepared By</td><td>${esc(
          meta.generatedBy || "Security Administrator"
      )}</td></tr>
      <tr><td style="font-weight:bold">Total Activity Events</td><td>${summary.total}</td></tr>
      <tr><td style="font-weight:bold">Visitor Requests</td><td>${summary.requests}</td></tr>
      <tr><td style="font-weight:bold">Patrol Rounds</td><td>${summary.patrols}</td></tr>
      <tr><td style="font-weight:bold">Incident Reports</td><td>${summary.incidents}</td></tr>
      <tr><td style="font-weight:bold">Distinct Users</td><td>${summary.users}</td></tr>
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
    `;

    const headers = [
        "#",
        "Date & Time",
        "User",
        "Role",
        "Activity",
        "Reference",
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
        rows
            .map((r, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;
                return `<tr>${[
                    i + 1,
                    fmtDateTime(r.occurredAt),
                    r.userName,
                    r.role ?? "—",
                    r.kind,
                    activityDetail(r),
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No activity within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>User Activity Report</x:Name>
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
