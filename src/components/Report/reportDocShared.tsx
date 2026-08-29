import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { orderedCounts } from "@/lib/reports/incidentReport";

/**
 * Shared building blocks for the document-style reports (Incident, Visitor…).
 *
 * `ReportScreen` renders the on-screen paper preview; `ReportPrintMount`
 * portals an identical copy to <body>. The print stylesheet hides `#root`
 * and shows only that copy, so `window.print()` yields a clean multi-page
 * document with no app chrome.
 */

export const DOC_STYLES = `
.ir-scroll{background:#e9edf2;padding:24px;border-radius:12px;overflow:auto}
.ir-doc{
    --ink:#1a1a1a;--muted:#5f5f5f;--faint:#8a8a8a;--rule:#333;--soft:#cfcfcf;
    width:794px;max-width:100%;margin:0 auto;background:#fff;color:var(--ink);
    font-family:Georgia,'Times New Roman',Times,serif;font-size:12px;line-height:1.55;
    padding:56px 60px;box-shadow:0 1px 4px rgba(15,23,42,.16);
}
.ir-doc *{box-sizing:border-box}
.ir-letterhead{text-align:center;border-bottom:2.5px solid var(--ink);padding-bottom:12px}
.ir-org{font-size:17px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ir-unit{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:5px}
.ir-addr{font-size:10px;color:var(--faint);margin-top:3px}
.ir-title{text-align:center;font-size:15px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin:26px 0 4px}
.ir-sub{text-align:center;font-size:11px;font-style:italic;color:var(--muted);margin-bottom:22px}
.ir-info{width:100%;border-collapse:collapse;margin-bottom:26px}
.ir-info td{border:1px solid var(--rule);padding:6px 10px;font-size:10px;vertical-align:top}
.ir-info td.k{background:#f1f1f1;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:118px;white-space:nowrap}
.ir-sec{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;border-bottom:1px solid #999;padding-bottom:4px;margin:24px 0 10px}
.ir-kv{width:100%;border-collapse:collapse}
.ir-kv td{padding:5px 0;font-size:11.5px;border-bottom:1px dotted var(--soft)}
.ir-kv td.k{color:var(--muted);width:260px}
.ir-kv td.v{font-weight:700}
.ir-grid{width:100%;border-collapse:collapse;margin-top:4px}
.ir-grid th{border:1px solid var(--rule);background:#e9e9e9;font-size:9px;text-transform:uppercase;letter-spacing:.04em;padding:6px;text-align:left}
.ir-grid td{border:1px solid #999;font-size:10px;padding:6px;vertical-align:top}
.ir-grid tbody tr:nth-child(even){background:#fafafa}
.ir-c{text-align:center}
.ir-mono{font-family:'Courier New',Courier,monospace;font-size:9.5px}
.ir-empty{font-size:11px;color:var(--faint);font-style:italic;margin:2px 0 0}
.ir-empty-cell{text-align:center;padding:22px;color:var(--faint);font-style:italic}
.ir-sign{display:flex;justify-content:space-between;gap:36px;margin-top:56px}
.ir-slot{flex:1;text-align:center}
.ir-line{border-top:1px solid var(--rule);margin-top:42px;padding-top:5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.ir-role{font-size:9px;color:var(--muted);margin-top:2px}
.ir-foot{margin-top:32px;border-top:1px solid var(--soft);padding-top:8px;font-size:9px;color:var(--faint);display:flex;justify-content:space-between}
.ir-conf{margin-top:8px;text-align:center;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:#9a9a9a}

.ir-print-portal{display:none}

@media print{
    #root{display:none !important}
    .ir-print-portal{display:block !important}
    .ir-print-portal .ir-scroll{background:#fff;padding:0;border-radius:0;overflow:visible}
    .ir-print-portal .ir-doc{width:100%;max-width:none;box-shadow:none;padding:0;margin:0}
    .ir-grid tr,.ir-sign{break-inside:avoid}
    .ir-sec{break-after:avoid}
    @page{size:A4;margin:18mm 14mm}
}
`;

/** Standard letterhead used by every report document. */
export function ReportLetterhead({ unit }: { unit: string }) {
    return (
        <header className="ir-letterhead">
            <div className="ir-org">Security Management System</div>
            <div className="ir-unit">Office of Campus Safety &amp; Security</div>
            <div className="ir-addr">{unit}</div>
        </header>
    );
}

/** Standard three-column signatory block. */
export function ReportSignatures({ preparedBy }: { preparedBy: string }) {
    return (
        <div className="ir-sign">
            <div className="ir-slot">
                <div className="ir-line">Prepared By</div>
                <div className="ir-role">{preparedBy}</div>
            </div>
            <div className="ir-slot">
                <div className="ir-line">Reviewed By</div>
                <div className="ir-role">Security Manager</div>
            </div>
            <div className="ir-slot">
                <div className="ir-line">Noted By</div>
                <div className="ir-role">Head, Campus Safety &amp; Security</div>
            </div>
        </div>
    );
}

/** Standard footer + confidentiality line. */
export function ReportFooter({
    reference,
    generatedLabel,
}: {
    reference: string;
    generatedLabel: string;
}) {
    return (
        <>
            <div className="ir-foot">
                <span>{reference}</span>
                <span>Generated {generatedLabel}</span>
            </div>
            <div className="ir-conf">Confidential — For Internal Use Only</div>
        </>
    );
}

/** Classification / Count / Share breakdown table. */
export function CountTable({
    counts,
    order = [],
}: {
    counts: Record<string, number>;
    order?: readonly string[];
}) {
    const pairs = orderedCounts(counts, order);

    if (!pairs.length) {
        return <p className="ir-empty">No data for the selected period.</p>;
    }

    const total = pairs.reduce((s, [, n]) => s + n, 0);

    return (
        <table className="ir-grid">
            <thead>
                <tr>
                    <th>Classification</th>
                    <th className="ir-c" style={{ width: 70 }}>
                        Count
                    </th>
                    <th className="ir-c" style={{ width: 70 }}>
                        Share
                    </th>
                </tr>
            </thead>
            <tbody>
                {pairs.map(([k, n]) => (
                    <tr key={k}>
                        <td>{k}</td>
                        <td className="ir-c">{n}</td>
                        <td className="ir-c">
                            {total ? Math.round((n / total) * 100) : 0}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/** On-screen, paper-style preview wrapper. */
export function ReportScreen({
    maxHeight,
    children,
}: {
    maxHeight?: number | string;
    children: ReactNode;
}) {
    return (
        <div className="ir-scroll" style={maxHeight ? { maxHeight } : undefined}>
            <style>{DOC_STYLES}</style>
            {children}
        </div>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function ReportPrintMount({ children }: { children: ReactNode }) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="ir-print-portal">
            <style>{DOC_STYLES}</style>
            <div className="ir-scroll">{children}</div>
        </div>,
        document.body
    );
}
