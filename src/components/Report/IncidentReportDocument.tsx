import {
    fmtDate,
    fmtDateTime,
    rangeLabel,
    SEVERITY_ORDER,
    type IncidentReportModel,
} from "@/lib/reports/incidentReport";
import {
    CountTable,
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

/** The Closed Incident Report body. */
function Sheet({ model }: { model: IncidentReportModel }) {
    const { meta, summary, rows, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Administrator";

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Incident Documentation & Records Unit" />

            <div className="ir-title">Closed Incident Report</div>
            <div className="ir-sub">
                Official record of incidents that have been resolved and formally closed
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
                        <td className="k">Total closed incidents</td>
                        <td className="v">{summary.total}</td>
                    </tr>
                    <tr>
                        <td className="k">Earliest close date</td>
                        <td className="v">
                            {summary.firstClosed ? fmtDate(summary.firstClosed) : "—"}
                        </td>
                    </tr>
                    <tr>
                        <td className="k">Latest close date</td>
                        <td className="v">
                            {summary.lastClosed ? fmtDate(summary.lastClosed) : "—"}
                        </td>
                    </tr>
                    <tr>
                        <td className="k">Average time to close (approx.)</td>
                        <td className="v">
                            {summary.avgCloseDays != null
                                ? `${summary.avgCloseDays} day${
                                      summary.avgCloseDays === 1 ? "" : "s"
                                  }`
                                : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">2. Breakdown by Severity</h2>
            <CountTable counts={summary.bySeverity} order={SEVERITY_ORDER} />

            <h2 className="ir-sec">3. Breakdown by Category</h2>
            <CountTable counts={summary.byCategory} />

            <h2 className="ir-sec">4. Incident Records</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th style={{ width: 88 }}>Incident No.</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Severity</th>
                        <th>Location</th>
                        <th>Reported By</th>
                        <th>Handled By</th>
                        <th style={{ width: 64 }}>Reported</th>
                        <th style={{ width: 64 }}>Closed</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="ir-empty-cell">
                                No closed incidents within the selected period.
                            </td>
                        </tr>
                    ) : (
                        rows.map((r, i) => (
                            <tr key={r.incident_id}>
                                <td className="ir-c">{i + 1}</td>
                                <td className="ir-mono">{r.incident_number}</td>
                                <td>{r.title}</td>
                                <td>{r.category}</td>
                                <td>{r.severity}</td>
                                <td>{r.location}</td>
                                <td>{r.reported_by_name}</td>
                                <td>{r.assigned_to_name || "—"}</td>
                                <td>{fmtDate(r.created_at)}</td>
                                <td>{fmtDate(r.updated_at)}</td>
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
export default function IncidentReportDocument({
    model,
    maxHeight,
}: {
    model: IncidentReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function IncidentReportPrintMount({
    model,
}: {
    model: IncidentReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
