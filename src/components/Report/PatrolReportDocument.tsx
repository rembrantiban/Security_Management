import { fmtDate, fmtDateTime, rangeLabel } from "@/lib/reports/incidentReport";
import {
    formatMinutes,
    patrolDurationMinutes,
    type PatrolReportModel,
} from "@/lib/reports/patrolReport";
import {
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

/** The Patrol Activity Report body. */
function Sheet({ model }: { model: PatrolReportModel }) {
    const { meta, summary, rows, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Personnel";

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Patrol Operations Unit" />

            <div className="ir-title">Patrol Activity Report</div>
            <div className="ir-sub">
                Record of completed patrols conducted by the assigned personnel
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
                        <td className="k">Completed patrols</td>
                        <td className="v">{summary.total}</td>
                    </tr>
                    <tr>
                        <td className="k">Distinct areas covered</td>
                        <td className="v">{summary.areas}</td>
                    </tr>
                    <tr>
                        <td className="k">Total time on patrol</td>
                        <td className="v">{formatMinutes(summary.totalMinutes)}</td>
                    </tr>
                    <tr>
                        <td className="k">Average patrol duration</td>
                        <td className="v">
                            {summary.avgMinutes != null
                                ? formatMinutes(summary.avgMinutes)
                                : "—"}
                        </td>
                    </tr>
                    <tr>
                        <td className="k">Earliest patrol in period</td>
                        <td className="v">
                            {summary.firstPatrol
                                ? fmtDate(summary.firstPatrol)
                                : "—"}
                        </td>
                    </tr>
                    <tr>
                        <td className="k">Latest patrol in period</td>
                        <td className="v">
                            {summary.lastPatrol ? fmtDate(summary.lastPatrol) : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">2. Patrol Records</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th style={{ width: 64 }}>Date</th>
                        <th>Area Patrolled</th>
                        <th>Scheduled</th>
                        <th>Actual Start</th>
                        <th>Actual End</th>
                        <th style={{ width: 60 }}>Duration</th>
                        <th>Observations</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="ir-empty-cell">
                                No completed patrols within the selected period.
                            </td>
                        </tr>
                    ) : (
                        rows.map((p, i) => {
                            const dur = patrolDurationMinutes(p);
                            return (
                                <tr key={p.patrol_log_id}>
                                    <td className="ir-c">{i + 1}</td>
                                    <td>{fmtDate(p.schedule_date)}</td>
                                    <td>{p.area_patrolled}</td>
                                    <td>
                                        {p.start_time} – {p.end_time}
                                    </td>
                                    <td>
                                        {p.patrol_start
                                            ? fmtDateTime(p.patrol_start)
                                            : "—"}
                                    </td>
                                    <td>
                                        {p.patrol_end
                                            ? fmtDateTime(p.patrol_end)
                                            : "—"}
                                    </td>
                                    <td>
                                        {dur != null ? formatMinutes(dur) : "—"}
                                    </td>
                                    <td>{p.observations || "—"}</td>
                                </tr>
                            );
                        })
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
export default function PatrolReportDocument({
    model,
    maxHeight,
}: {
    model: PatrolReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function PatrolReportPrintMount({
    model,
}: {
    model: PatrolReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
