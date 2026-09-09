import type { Incident } from "@/store/useIncidentReportStore";

/**
 * Security Records helpers (module 8).
 *
 *  8.2 Search Records  — free-text match across title, number, location, category
 *  8.3 Filter Records  — by severity and status
 *  8.6 Export Records  — spreadsheet download of the current result set
 */

export type RecordFilters = {
    search: string;
    severity: string; // "all" | severity
    status: string; // "all" | status
    includeClosed?: boolean; // records register keeps Closed rows
};

/** 8.2 + 8.3 — the single source of truth for what the records list shows. */
export function filterIncidentRecords(
    incidents: Incident[],
    filters: RecordFilters
): Incident[] {
    const query = filters.search.trim().toLowerCase();

    return incidents.filter((incident) => {
        // The active incidents list hides Closed rows; the records register keeps them.
        if (!filters.includeClosed && incident.status === "Closed") return false;

        const matchesSearch =
            query === "" ||
            incident.title.toLowerCase().includes(query) ||
            incident.incident_number.toLowerCase().includes(query) ||
            incident.location.toLowerCase().includes(query) ||
            incident.category.toLowerCase().includes(query);

        const matchesSeverity =
            filters.severity === "all" ||
            incident.severity === filters.severity;

        const matchesStatus =
            filters.status === "all" || incident.status === filters.status;

        return matchesSearch && matchesSeverity && matchesStatus;
    });
}

/* ------------------------------------------------------------------ */
/* 8.6 Export Security Records — Excel (.xls)                          */
/* ------------------------------------------------------------------ */

function esc(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function fmtDateTime(value: string): string {
    return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
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

export function exportSecurityRecordsExcel(rows: Incident[]): void {
    const headers = [
        "#",
        "Incident No.",
        "Title",
        "Category",
        "Severity",
        "Status",
        "Location",
        "Reported By",
        "Assigned To",
        "Reported At",
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
            .map((incident, i) => {
                const cell = (v: unknown) =>
                    `<td style="border:1px solid #999;padding:5px 9px;vertical-align:top">${esc(
                        v
                    )}</td>`;

                return `<tr>${[
                    i + 1,
                    incident.incident_number,
                    incident.title,
                    incident.category,
                    incident.severity,
                    incident.status,
                    incident.location,
                    incident.reported_by_name,
                    incident.assigned_to_name || "Unassigned",
                    fmtDateTime(incident.created_at),
                ]
                    .map(cell)
                    .join("")}</tr>`;
            })
            .join("") ||
        `<tr><td colspan="${headers.length}" style="border:1px solid #999;padding:8px;text-align:center">No security records to export.</td></tr>`;

    const generatedAt = fmtDateTime(new Date().toISOString());

    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Security Records</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
<table>
  <tr><td colspan="2" style="font-size:15px;font-weight:bold">SECURITY RECORDS EXPORT</td></tr>
  <tr><td style="font-weight:bold;width:150px">Generated</td><td>${esc(generatedAt)}</td></tr>
  <tr><td style="font-weight:bold">Total Records</td><td>${rows.length}</td></tr>
  <tr><td style="font-weight:bold">Classification</td><td>Confidential</td></tr>
  <tr><td></td></tr>
</table>
<table border="1"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
</body>
</html>`;

    const blob = new Blob(["﻿", doc], {
        type: "application/vnd.ms-excel;charset=utf-8",
    });

    const stamp = new Date().toISOString().slice(0, 10);
    triggerDownload(blob, `Security-Records_${stamp}.xls`);
}
