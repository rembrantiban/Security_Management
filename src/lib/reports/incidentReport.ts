import type { Incident } from "@/store/useIncidentReportStore";

/**
 * Closed Incident Report — data + spreadsheet export.
 *
 * `buildIncidentReport` shapes the closed-incident dataset. The printable
 * document itself is a real React component (`IncidentReportDocument`) that
 * is rendered on the page and printed with `window.print()`. This module
 * only provides the model, formatters, and the native `.xls` export.
 */

export type ReportMeta = {
    title: string;
    dateFrom: string; // yyyy-mm-dd, "" means unbounded
    dateTo: string; // yyyy-mm-dd, "" means unbounded
    generatedBy?: string;
};

export type IncidentReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: Incident[];
    summary: {
        total: number;
        bySeverity: Record<string, number>;
        byCategory: Record<string, number>;
        avgCloseDays: number | null;
        firstClosed: string | null;
        lastClosed: string | null;
    };
};

/** Only incidents in this status are included in the report. */
export const CLOSED_STATUS = "Closed";

export const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export const fmtDate = (v: string | Date) =>
    new Date(v).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const fmtDateTime = (v: string | Date) =>
    new Date(v).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

export function rangeLabel(meta: ReportMeta): string {
    if (!meta.dateFrom && !meta.dateTo) return "All dates";
    if (meta.dateFrom && !meta.dateTo) return `From ${fmtDate(meta.dateFrom)}`;
    if (!meta.dateFrom && meta.dateTo) return `Through ${fmtDate(meta.dateTo)}`;
    return `${fmtDate(meta.dateFrom)} to ${fmtDate(meta.dateTo)}`;
}

function makeReference(d: Date): string {
    return `IR-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

export function buildIncidentReport(
    incidents: Incident[],
    meta: ReportMeta
): IncidentReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const rows = incidents
        .filter((i) => i.status === CLOSED_STATUS)
        .filter((i) => {
            const t = new Date(i.created_at).getTime();
            if (from && t < from.getTime()) return false;
            if (to && t > to.getTime()) return false;
            return true;
        })
        .sort(
            (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
        );

    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const r of rows) {
        bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
        byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }

    const durations = rows
        .map(
            (r) =>
                new Date(r.updated_at).getTime() -
                new Date(r.created_at).getTime()
        )
        .filter((ms) => ms >= 0);

    const avgCloseDays = durations.length
        ? Math.round(
              (durations.reduce((a, b) => a + b, 0) /
                  durations.length /
                  86_400_000) *
                  10
          ) / 10
        : null;

    const closeTimes = rows.map((r) => new Date(r.updated_at).getTime());

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            bySeverity,
            byCategory,
            avgCloseDays,
            firstClosed: closeTimes.length
                ? new Date(Math.min(...closeTimes)).toISOString()
                : null,
            lastClosed: closeTimes.length
                ? new Date(Math.max(...closeTimes)).toISOString()
                : null,
        },
    };
}

/** Ordered [key, count] pairs: known order first, then the rest by count. */
export function orderedCounts(
    counts: Record<string, number>,
    order: readonly string[] = []
): [string, number][] {
    const known = order.filter((k) => counts[k]);
    const extra = Object.keys(counts)
        .filter((k) => !order.includes(k as never))
        .sort((a, b) => counts[b] - counts[a]);
    return [...known, ...extra].map((k) => [k, counts[k]]);
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

function fileBase(model: IncidentReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `Closed-Incident-Report_${f}_${t}`;
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

export function downloadIncidentReportExcel(model: IncidentReportModel): void {
    const { meta, summary, rows, generatedAt, reference } = model;

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">CLOSED INCIDENT REPORT</td></tr>
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
      <tr><td style="font-weight:bold">Total Records</td><td>${summary.total}</td></tr>
      <tr><td style="font-weight:bold">Avg. Time to Close</td><td>${
          summary.avgCloseDays != null ? `${summary.avgCloseDays} day(s)` : "—"
      }</td></tr>
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
    `;

    const headers = [
        "#",
        "Incident Number",
        "Title",
        "Category",
        "Severity",
        "Status",
        "Location",
        "Description",
        "Reported By",
        "Handled By",
        "Reported At",
        "Closed At",
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
                    r.incident_number,
                    r.title,
                    r.category,
                    r.severity,
                    r.status,
                    r.location,
                    r.description,
                    r.reported_by_name,
                    r.assigned_to_name || "Unassigned",
                    fmtDateTime(r.created_at),
                    fmtDateTime(r.updated_at),
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No closed incidents within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Closed Incident Report</x:Name>
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
