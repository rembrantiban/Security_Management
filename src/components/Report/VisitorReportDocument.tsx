import { fmtDate, fmtDateTime, rangeLabel } from "@/lib/reports/incidentReport";
import {
    ID_TYPE_FALLBACK,
    visitorName,
    type VisitorReportModel,
} from "@/lib/reports/visitorReport";
import {
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

/** The Visitor Access Report body. */
function Sheet({ model }: { model: VisitorReportModel }) {
    const { meta, summary, rows, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Administrator";

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Visitor & Access Control Unit" />

            <div className="ir-title">Visitor Access Report</div>
            <div className="ir-sub">
                Official record of completed visits — visitors whose exit has been recorded
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
                        <td className="k">Period Covered</td>
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
                        <td className="k">Total completed visits</td>
                        <td className="v">{summary.total}</td>
                    </tr>
                    <tr>
                        <td className="k">Approved</td>
                        <td className="v">{summary.approved}</td>
                    </tr>
                    <tr>
                        <td className="k">Rejected</td>
                        <td className="v">{summary.rejected}</td>
                    </tr>
                    <tr>
                        <td className="k">Currently on-site</td>
                        <td className="v">{summary.onSite}</td>
                    </tr>
                    <tr>
                        <td className="k">Exit recorded</td>
                        <td className="v">{summary.exited}</td>
                    </tr>
                    <tr>
                        <td className="k">Average time to decision (approx.)</td>
                        <td className="v">
                            {summary.avgDecisionHours != null
                                ? `${summary.avgDecisionHours} hour${
                                      summary.avgDecisionHours === 1 ? "" : "s"
                                  }`
                                : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">2. Visitor Records</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th style={{ width: 92 }}>Request No.</th>
                        <th>Visitor</th>
                        <th>Purpose</th>
                        <th>ID Type</th>
                        <th>Status</th>
                        <th>Decision By</th>
                        <th style={{ width: 64 }}>Requested</th>
                        <th style={{ width: 64 }}>Exit</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="ir-empty-cell">
                                No visitor exits recorded within the selected period.
                            </td>
                        </tr>
                    ) : (
                        rows.map((r, i) => (
                            <tr key={r.request_id}>
                                <td className="ir-c">{i + 1}</td>
                                <td className="ir-mono">{r.request_number}</td>
                                <td>{visitorName(r)}</td>
                                <td>{r.purpose}</td>
                                <td>{r.id_type || ID_TYPE_FALLBACK}</td>
                                <td>{r.status}</td>
                                <td>{r.approved_by_name || "—"}</td>
                                <td>{fmtDate(r.created_at)}</td>
                                <td>
                                    {r.checked_out_at
                                        ? fmtDate(r.checked_out_at)
                                        : "—"}
                                </td>
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
export default function VisitorReportDocument({
    model,
    maxHeight,
}: {
    model: VisitorReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function VisitorReportPrintMount({
    model,
}: {
    model: VisitorReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
