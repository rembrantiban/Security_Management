import type { RequestAccess } from "@/store/useRequestStore";
import {
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";

/**
 * Visitor Access Report — data + spreadsheet export.
 *
 * Mirrors the Closed Incident Report: `buildVisitorReport` shapes the set of
 * completed visits — access requests with a recorded exit — within the period;
 * the document itself is a React component (`VisitorReportDocument`) printed
 * with `window.print()`.
 */

export type { ReportMeta };

export type VisitorReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: RequestAccess[];
    summary: {
        total: number;
        approved: number;
        rejected: number;
        onSite: number; // approved and not yet checked out
        exited: number; // exit recorded
        byStatus: Record<string, number>;
        byIdType: Record<string, number>;
        avgDecisionHours: number | null; // approved_at - created_at
    };
};

export const STATUS_ORDER = ["Approved", "Rejected", "Pending"] as const;
export const ID_TYPE_FALLBACK = "Not specified";

const pad = (n: number) => String(n).padStart(2, "0");

export function visitorName(r: RequestAccess): string {
    return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");
}

function makeReference(d: Date): string {
    return `VR-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
        d.getHours()
    )}${pad(d.getMinutes())}`;
}

export function buildVisitorReport(
    requests: RequestAccess[],
    meta: ReportMeta
): VisitorReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    // Completed visits only: a visitor whose exit has been recorded.
    const rows = requests
        .filter((r) => !!r.checked_out_at)
        .filter((r) => {
            const t = new Date(r.checked_out_at as string).getTime();
            if (Number.isNaN(t)) return false;
            if (from && t < from.getTime()) return false;
            if (to && t > to.getTime()) return false;
            return true;
        })
        .sort(
            (a, b) =>
                new Date(b.checked_out_at as string).getTime() -
                new Date(a.checked_out_at as string).getTime()
        );

    const byStatus: Record<string, number> = {};
    const byIdType: Record<string, number> = {};

    for (const r of rows) {
        byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
        const idt = r.id_type?.trim() || ID_TYPE_FALLBACK;
        byIdType[idt] = (byIdType[idt] ?? 0) + 1;
    }

    const decisionDurations = rows
        .filter((r) => r.approved_at)
        .map(
            (r) =>
                new Date(r.approved_at as string).getTime() -
                new Date(r.created_at).getTime()
        )
        .filter((ms) => ms >= 0);

    const avgDecisionHours = decisionDurations.length
        ? Math.round(
              (decisionDurations.reduce((a, b) => a + b, 0) /
                  decisionDurations.length /
                  3_600_000) *
                  10
          ) / 10
        : null;

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            approved: byStatus["Approved"] ?? 0,
            rejected: byStatus["Rejected"] ?? 0,
            onSite: rows.filter(
                (r) => r.status === "Approved" && !r.checked_out_at
            ).length,
            exited: rows.filter((r) => !!r.checked_out_at).length,
            byStatus,
            byIdType,
            avgDecisionHours,
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

function fileBase(model: VisitorReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `Visitor-Access-Report_${f}_${t}`;
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

export function downloadVisitorReportExcel(model: VisitorReportModel): void {
    const { meta, summary, rows, generatedAt, reference } = model;

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">VISITOR ACCESS REPORT</td></tr>
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
      <tr><td style="font-weight:bold">Approved</td><td>${summary.approved}</td></tr>
      <tr><td style="font-weight:bold">Rejected</td><td>${summary.rejected}</td></tr>
      <tr><td style="font-weight:bold">Currently On-site</td><td>${summary.onSite}</td></tr>
      <tr><td style="font-weight:bold">Exit Recorded</td><td>${summary.exited}</td></tr>
      <tr><td style="font-weight:bold">Avg. Time to Decision</td><td>${
          summary.avgDecisionHours != null
              ? `${summary.avgDecisionHours} hour(s)`
              : "—"
      }</td></tr>
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
    `;

    const headers = [
        "#",
        "Request Number",
        "Visitor",
        "Purpose",
        "ID Type",
        "Status",
        "Requested By",
        "Decision By",
        "Requested At",
        "Decision At",
        "Exit Recorded At",
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
                    r.request_number,
                    visitorName(r),
                    r.purpose,
                    r.id_type || ID_TYPE_FALLBACK,
                    r.status,
                    r.requested_by_name,
                    r.approved_by_name || "—",
                    fmtDateTime(r.created_at),
                    r.approved_at ? fmtDateTime(r.approved_at) : "—",
                    r.checked_out_at ? fmtDateTime(r.checked_out_at) : "—",
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No visitor exits recorded within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Visitor Access Report</x:Name>
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
