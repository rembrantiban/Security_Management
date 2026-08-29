import type { PatrolLog } from "@/store/usePatrolStore";
import {
    fmtDateTime,
    rangeLabel,
    type ReportMeta,
} from "./incidentReport";

/**
 * Patrol Activity Report — data + spreadsheet export.
 *
 * Mirrors the other document-style reports: `buildPatrolReport` shapes the set
 * of completed patrols within the period; the document is a React component
 * printed with `window.print()`.
 */

export type { ReportMeta };

export type PatrolReportModel = {
    meta: ReportMeta;
    reference: string;
    generatedAt: Date;
    rows: PatrolLog[];
    summary: {
        total: number;
        areas: number;
        totalMinutes: number;
        avgMinutes: number | null;
        firstPatrol: string | null;
        lastPatrol: string | null;
    };
};

const pad = (n: number) => String(n).padStart(2, "0");

export function patrolDurationMinutes(p: PatrolLog): number | null {
    if (!p.patrol_start || !p.patrol_end) return null;
    const ms =
        new Date(p.patrol_end).getTime() - new Date(p.patrol_start).getTime();
    if (Number.isNaN(ms) || ms < 0) return null;
    return Math.round(ms / 60000);
}

export function formatMinutes(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function makeReference(d: Date): string {
    return `PAR-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
        d.getDate()
    )}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function buildPatrolReport(
    patrols: PatrolLog[],
    meta: ReportMeta
): PatrolReportModel {
    const from = meta.dateFrom ? new Date(`${meta.dateFrom}T00:00:00`) : null;
    const to = meta.dateTo ? new Date(`${meta.dateTo}T23:59:59.999`) : null;

    const rows = patrols
        .filter((p) => p.status === "Completed")
        .filter((p) => {
            const t = new Date(p.schedule_date).getTime();
            if (Number.isNaN(t)) return false;
            if (from && t < from.getTime()) return false;
            if (to && t > to.getTime()) return false;
            return true;
        })
        .sort(
            (a, b) =>
                new Date(b.schedule_date).getTime() -
                new Date(a.schedule_date).getTime()
        );

    const durations = rows
        .map(patrolDurationMinutes)
        .filter((m): m is number => m != null);

    const totalMinutes = durations.reduce((a, b) => a + b, 0);
    const dates = rows.map((p) => new Date(p.schedule_date).getTime());

    return {
        meta,
        reference: makeReference(new Date()),
        generatedAt: new Date(),
        rows,
        summary: {
            total: rows.length,
            areas: new Set(rows.map((p) => p.area_patrolled)).size,
            totalMinutes,
            avgMinutes: durations.length
                ? Math.round(totalMinutes / durations.length)
                : null,
            firstPatrol: dates.length
                ? new Date(Math.min(...dates)).toISOString()
                : null,
            lastPatrol: dates.length
                ? new Date(Math.max(...dates)).toISOString()
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

function fileBase(model: PatrolReportModel): string {
    const f = model.meta.dateFrom || "all";
    const t = model.meta.dateTo || "all";
    return `Patrol-Activity-Report_${f}_${t}`;
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

export function downloadPatrolReportExcel(model: PatrolReportModel): void {
    const { meta, summary, rows, generatedAt, reference } = model;

    const metaRows = `
      <tr><td colspan="2" style="font-size:15px;font-weight:bold">PATROL ACTIVITY REPORT</td></tr>
      <tr><td style="font-weight:bold;width:150px">Report No.</td><td>${esc(reference)}</td></tr>
      <tr><td style="font-weight:bold">Period Covered</td><td>${esc(
          rangeLabel(meta)
      )}</td></tr>
      <tr><td style="font-weight:bold">Date Generated</td><td>${esc(
          fmtDateTime(generatedAt)
      )}</td></tr>
      <tr><td style="font-weight:bold">Prepared By</td><td>${esc(
          meta.generatedBy || "Security Personnel"
      )}</td></tr>
      <tr><td style="font-weight:bold">Completed Patrols</td><td>${summary.total}</td></tr>
      <tr><td style="font-weight:bold">Areas Covered</td><td>${summary.areas}</td></tr>
      <tr><td style="font-weight:bold">Total Time On Patrol</td><td>${formatMinutes(
          summary.totalMinutes
      )}</td></tr>
      <tr><td style="font-weight:bold">Average Duration</td><td>${
          summary.avgMinutes != null ? formatMinutes(summary.avgMinutes) : "—"
      }</td></tr>
      <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
      <tr><td></td></tr>
    `;

    const headers = [
        "#",
        "Patrol Date",
        "Area Patrolled",
        "Scheduled Window",
        "Actual Start",
        "Actual End",
        "Duration",
        "Observations",
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
            .map((p, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;
                const dur = patrolDurationMinutes(p);
                return `<tr>${[
                    i + 1,
                    fmtDateTime(p.schedule_date),
                    p.area_patrolled,
                    `${p.start_time} - ${p.end_time}`,
                    p.patrol_start ? fmtDateTime(p.patrol_start) : "—",
                    p.patrol_end ? fmtDateTime(p.patrol_end) : "—",
                    dur != null ? formatMinutes(dur) : "—",
                    p.observations || "—",
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No completed patrols within the selected period.</td></tr>`;

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Patrol Activity Report</x:Name>
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
