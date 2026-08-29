import type { ActivityLog } from "@/store/useActivityStore";
import {
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";

/**
 * User Activity Report — data + spreadsheet export.
 *
 * An activity log for Security Personnel and Authorized Staff, drawn from the
 * `activity_logs` table: session logins, visitor access requests submitted,
 * and incident reports submitted. Events are filtered to the reporting period
 * and listed newest-first.
 */

export type { ReportMeta };

export type UserActivityReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: ActivityLog[];
    summary: {
        total: number;
        logins: number;
        requests: number;
        incidents: number;
        users: number;
        firstEvent: string | null;
        lastEvent: string | null;
    };
};

/** The report only covers field personnel — not administrators. */
const REPORTED_ROLES = new Set(["Security Personnel", "Authorized Staff"]);

const pad = (n: number) => String(n).padStart(2, "0");

export function activityDetail(log: ActivityLog): string {
    if (log.reference && log.detail) return `${log.reference} — ${log.detail}`;
    return log.reference || log.detail || "—";
}

function makeReference(d: Date): string {
    return `UA-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

export function buildUserActivityReport(
    logs: ActivityLog[],
    meta: ReportMeta
): UserActivityReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const rows = logs
        .filter((l) => !!l.role && REPORTED_ROLES.has(l.role))
        .filter((l) => {
            const t = new Date(l.created_at).getTime();
            if (Number.isNaN(t)) return false;
            if (from && t < from.getTime()) return false;
            if (to && t > to.getTime()) return false;
            return true;
        })
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

    const times = rows.map((l) => new Date(l.created_at).getTime());

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            logins: rows.filter((l) => l.action === "Login").length,
            requests: rows.filter((l) => l.action === "Visitor Request").length,
            incidents: rows.filter((l) => l.action === "Incident Report").length,
            users: new Set(rows.map((l) => l.user_id)).size,
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
      <tr><td style="font-weight:bold">Logins</td><td>${summary.logins}</td></tr>
      <tr><td style="font-weight:bold">Visitor Requests</td><td>${summary.requests}</td></tr>
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
            .map((l, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;
                return `<tr>${[
                    i + 1,
                    fmtDateTime(l.created_at),
                    l.user_name,
                    l.role ?? "—",
                    l.action,
                    activityDetail(l),
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
