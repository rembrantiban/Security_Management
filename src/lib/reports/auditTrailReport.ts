import {
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";

/**
 * Audit Trail Report — data + spreadsheet export.
 *
 * A chronological record of report-generation activity in this Reports Center:
 * every time a report is generated (PDF or Excel) an audit event is captured
 * and surfaced here, newest-first, scoped to the reporting period.
 */

export type { ReportMeta };

export type AuditEvent = {
    id: number;
    at: string; // ISO timestamp
    actor: string;
    action: string;
    target: string;
    format: string;
    detail: string;
};

export type AuditTrailReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: AuditEvent[];
    summary: {
        total: number;
        actors: number;
        formats: Record<string, number>;
        firstEvent: string | null;
        lastEvent: string | null;
    };
};

export const AUDIT_FORMAT_ORDER = ["PDF", "Excel"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

function makeReference(d: Date): string {
    return `AUD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

export function buildAuditTrailReport(
    events: AuditEvent[],
    meta: ReportMeta
): AuditTrailReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const rows = events
        .filter((e) => {
            const t = new Date(e.at).getTime();
            if (Number.isNaN(t)) return false;
            if (from && t < from.getTime()) return false;
            if (to && t > to.getTime()) return false;
            return true;
        })
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    const formats: Record<string, number> = {};
    for (const e of rows) {
        formats[e.format] = (formats[e.format] ?? 0) + 1;
    }

    const times = rows.map((e) => new Date(e.at).getTime());

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            actors: new Set(rows.map((e) => e.actor).filter(Boolean)).size,
            formats,
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

function fileBase(model: AuditTrailReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `Audit-Trail-Report_${f}_${t}`;
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

export function downloadAuditTrailReportExcel(
    model: AuditTrailReportModel
): void {
    const { meta, summary, rows, generatedAt, reference } = model;

    const formatBreakdown = AUDIT_FORMAT_ORDER.filter(
        (f) => (summary.formats[f] ?? 0) > 0
    )
        .map(
            (f) =>
                `<tr><td style="font-weight:bold">${esc(f)} exports</td><td>${
                    summary.formats[f] ?? 0
                }</td></tr>`
        )
        .join("");

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">AUDIT TRAIL REPORT</td></tr>
      <tr><td style="font-weight:bold;width:150px">Report No.</td><td>${esc(reference)}</td></tr>
      <tr><td style="font-weight:bold">Coverage</td><td>${esc(
          rangeLabel(meta)
      )}</td></tr>
      <tr><td style="font-weight:bold">Date Generated</td><td>${esc(
          fmtDateTime(generatedAt)
      )}</td></tr>
      <tr><td style="font-weight:bold">Prepared By</td><td>${esc(
          meta.generatedBy || "Security Administrator"
      )}</td></tr>
      <tr><td style="font-weight:bold">Total Events</td><td>${summary.total}</td></tr>
      <tr><td style="font-weight:bold">Distinct Users</td><td>${summary.actors}</td></tr>
      ${formatBreakdown}
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
    `;

    const headers = ["#", "Timestamp", "User", "Action", "Format", "Details"];

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
            .map((e, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;
                return `<tr>${[
                    i + 1,
                    fmtDateTime(e.at),
                    e.actor,
                    e.action,
                    e.format,
                    e.detail,
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No audit events within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Audit Trail Report</x:Name>
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
