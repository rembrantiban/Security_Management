import { fmtDateTime, rangeLabel } from "@/lib/reports/incidentReport";
import {
    activityDetail,
    type UserActivityReportModel,
} from "@/lib/reports/userActivityReport";
import {
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

/** The User Activity Report body. */
function Sheet({ model }: { model: UserActivityReportModel }) {
    const { meta, summary, rows, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Administrator";

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Personnel Records & Access Unit" />

            <div className="ir-title">User Activity Report</div>
            <div className="ir-sub">
                Login and submission activity of Security Personnel and Authorized Staff
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
                        <td className="k">Total activity events</td>
                        <td className="v">{summary.total}</td>
                    </tr>
                    <tr>
                        <td className="k">Logins</td>
                        <td className="v">{summary.logins}</td>
                    </tr>
                    <tr>
                        <td className="k">Visitor requests submitted</td>
                        <td className="v">{summary.requests}</td>
                    </tr>
                    <tr>
                        <td className="k">Incident reports submitted</td>
                        <td className="v">{summary.incidents}</td>
                    </tr>
                    <tr>
                        <td className="k">Distinct users</td>
                        <td className="v">{summary.users}</td>
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

            <h2 className="ir-sec">2. Activity Records</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th style={{ width: 108 }}>Date &amp; Time</th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Activity</th>
                        <th>Reference</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="ir-empty-cell">
                                No activity within the selected period.
                            </td>
                        </tr>
                    ) : (
                        rows.map((l, i) => (
                            <tr key={l.activity_id}>
                                <td className="ir-c">{i + 1}</td>
                                <td>{fmtDateTime(l.created_at)}</td>
                                <td>{l.user_name}</td>
                                <td>{l.role ?? "—"}</td>
                                <td>{l.action}</td>
                                <td className="ir-mono">{activityDetail(l)}</td>
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
export default function UserActivityReportDocument({
    model,
    maxHeight,
}: {
    model: UserActivityReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function UserActivityReportPrintMount({
    model,
}: {
    model: UserActivityReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
