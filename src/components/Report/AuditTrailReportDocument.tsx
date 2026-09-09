import { fmtDateTime, rangeLabel } from "@/lib/reports/incidentReport";
import {
    AUDIT_FORMAT_ORDER,
    type AuditTrailReportModel,
} from "@/lib/reports/auditTrailReport";
import {
    CountTable,
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

/** The Audit Trail Report body. */
function Sheet({ model }: { model: AuditTrailReportModel }) {
    const { meta, summary, rows, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Administrator";

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Information Security & Compliance Unit" />

            <div className="ir-title">Audit Trail Report</div>
            <div className="ir-sub">
                Chronological record of reports generated from the Reports Center
            </div>

            <table className="ir-info">
                <tbody>
                    <tr>
                        <td className="k">Report No.</td>
                        <td>{reference}</td>
                        <td className="k">Date Generated</td>
                        <td>{fmtDateTime(generatedAt)}</td>
                    </tr>
                    <tr>
                        <td className="k">Coverage</td>
                        <td>{rangeLabel(meta)}</td>
                        <td className="k">Prepared By</td>
                        <td>{preparedBy}</td>
                    </tr>
                    <tr>
                        <td className="k">Total Records</td>
                        <td>{summary.total}</td>
                        <td className="k">Classification</td>
                        <td>Confidential</td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">1. Summary</h2>
            <table className="ir-kv">
                <tbody>
                    <tr>
                        <td className="k">Total audit events</td>
                        <td className="v">{summary.total}</td>
                    </tr>
                    <tr>
                        <td className="k">Distinct users</td>
                        <td className="v">{summary.actors}</td>
                    </tr>
                    <tr>
                        <td className="k">First event in period</td>
                        <td className="v">
                            {summary.firstEvent
                                ? fmtDateTime(summary.firstEvent)
                                : "—"}
                        </td>
                    </tr>
                    <tr>
                        <td className="k">Last event in period</td>
                        <td className="v">
                            {summary.lastEvent
                                ? fmtDateTime(summary.lastEvent)
                                : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">2. Breakdown by Export Format</h2>
            <CountTable counts={summary.formats} order={AUDIT_FORMAT_ORDER} />

            <h2 className="ir-sec">3. Audit Events</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th style={{ width: 116 }}>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th style={{ width: 60 }}>Format</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="ir-empty-cell">
                                No audit events within the selected period.
                            </td>
                        </tr>
                    ) : (
                        rows.map((event, i) => (
                            <tr key={event.id}>
                                <td className="ir-c">{i + 1}</td>
                                <td>{fmtDateTime(event.at)}</td>
                                <td>{event.actor}</td>
                                <td>{event.action}</td>
                                <td>{event.format}</td>
                                <td>{event.detail}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <ReportSignatures preparedBy={preparedBy} />
            <ReportFooter
                reference={reference}
                generatedLabel={fmtDateTime(generatedAt)}
            />

        </article>
    );
}

/** On-screen, paper-style preview. */
export default function AuditTrailReportDocument({
    model,
    maxHeight,
}: {
    model: AuditTrailReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function AuditTrailReportPrintMount({
    model,
}: {
    model: AuditTrailReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
