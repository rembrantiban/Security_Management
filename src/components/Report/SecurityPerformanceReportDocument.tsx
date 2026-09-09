import { fmtDate, fmtDateTime, rangeLabel } from "@/lib/reports/incidentReport";
import {
    formatElapsed,
    formatRate,
    type SecurityPerformanceReportModel,
} from "@/lib/reports/securityPerformanceReport";
import {
    ReportFooter,
    ReportLetterhead,
    ReportPrintMount,
    ReportScreen,
    ReportSignatures,
} from "./reportDocShared";

type MetricRow = { label: string; value: string };

/** A titled block of key/value metric rows inside the summary section. */
function MetricGroup({ title, rows }: { title: string; rows: MetricRow[] }) {
    return (
        <>
            <tr>
                <td
                    className="k"
                    colSpan={2}
                    style={{
                        paddingTop: 12,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: "10.5px",
                    }}
                >
                    {title}
                </td>
            </tr>
            {rows.map((row) => (
                <tr key={row.label}>
                    <td className="k">{row.label}</td>
                    <td className="v">{row.value}</td>
                </tr>
            ))}
        </>
    );
}

/** The Security Performance Report body. */
function Sheet({ model }: { model: SecurityPerformanceReportModel }) {
    const { meta, summary, personnel, generatedAt, reference } = model;
    const preparedBy = meta.generatedBy || "Security Administrator";

    const incidentRows: MetricRow[] = [
        { label: "Incidents logged", value: String(summary.incidentsTotal) },
        {
            label: "Resolved / closed",
            value: String(summary.incidentsResolved),
        },
        {
            label: "Resolution rate",
            value: formatRate(summary.incidentResolutionRate),
        },
        {
            label: "Average time to resolve",
            value: formatElapsed(summary.avgIncidentResolutionMs),
        },
        {
            label: "Critical / high incidents",
            value: String(summary.criticalHighTotal),
        },
        {
            label: "Critical / high resolution rate",
            value: formatRate(summary.criticalHighResolutionRate),
        },
        { label: "Still open", value: String(summary.openIncidents) },
    ];

    const patrolRows: MetricRow[] = [
        {
            label: "Patrols scheduled",
            value: String(summary.patrolsScheduled),
        },
        {
            label: "Patrols completed",
            value: String(summary.patrolsCompleted),
        },
        {
            label: "Completion rate",
            value: formatRate(summary.patrolCompletionRate),
        },
        {
            label: "Average duration",
            value:
                summary.avgPatrolMinutes != null
                    ? `${summary.avgPatrolMinutes} min`
                    : "—",
        },
        { label: "Missed patrols", value: String(summary.missedPatrols) },
    ];

    const accessRows: MetricRow[] = [
        { label: "Requests received", value: String(summary.requestsTotal) },
        { label: "Decisions made", value: String(summary.requestsDecided) },
        {
            label: "Approval rate",
            value: formatRate(summary.requestApprovalRate),
        },
        {
            label: "Average decision turnaround",
            value: formatElapsed(summary.avgRequestDecisionMs),
        },
        {
            label: "Pending decision",
            value: String(summary.pendingRequests),
        },
    ];

    return (
        <article className="ir-doc">

            <ReportLetterhead unit="Security Operations Centre" />

            <div className="ir-title">Security Performance Report</div>
            <div className="ir-sub">
                Response times, resolution rates, and personnel effectiveness
                for the reporting period
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
                        <td className="k">Records Analysed</td>
                        <td>{summary.total}</td>
                        <td className="k">Classification</td>
                        <td>Confidential</td>
                    </tr>
                    <tr>
                        <td className="k">Activity Window</td>
                        <td colSpan={3}>
                            {summary.firstActivity && summary.lastActivity
                                ? `${fmtDate(summary.firstActivity)} – ${fmtDate(
                                      summary.lastActivity
                                  )}`
                                : "No activity in period"}
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className="ir-sec">1. Performance Summary</h2>
            <table className="ir-kv">
                <tbody>
                    <MetricGroup title="Incident Response" rows={incidentRows} />
                    <MetricGroup title="Patrol Operations" rows={patrolRows} />
                    <MetricGroup title="Access Control" rows={accessRows} />
                </tbody>
            </table>

            <h2 className="ir-sec">2. Personnel Effectiveness</h2>
            <table className="ir-grid">
                <thead>
                    <tr>
                        <th className="ir-c" style={{ width: 24 }}>
                            #
                        </th>
                        <th>Personnel</th>
                        <th>Role</th>
                        <th className="ir-c" style={{ width: 58 }}>
                            Inc. Res / Asg
                        </th>
                        <th className="ir-c" style={{ width: 52 }}>
                            Res. Rate
                        </th>
                        <th className="ir-c" style={{ width: 62 }}>
                            Avg. Resolve
                        </th>
                        <th className="ir-c" style={{ width: 58 }}>
                            Ptl. Done / Asg
                        </th>
                        <th className="ir-c" style={{ width: 52 }}>
                            Ptl. Rate
                        </th>
                        <th className="ir-c" style={{ width: 46 }}>
                            Req.
                        </th>
                        <th className="ir-c" style={{ width: 52 }}>
                            Effect.
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {personnel.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="ir-empty-cell">
                                No personnel activity within the selected
                                period.
                            </td>
                        </tr>
                    ) : (
                        personnel.map((p, i) => (
                            <tr key={p.userName}>
                                <td className="ir-c">{i + 1}</td>
                                <td>{p.userName}</td>
                                <td>{p.role}</td>
                                <td className="ir-c">
                                    {p.incidentsResolved} / {p.incidentsAssigned}
                                </td>
                                <td className="ir-c">
                                    {formatRate(p.incidentResolutionRate)}
                                </td>
                                <td className="ir-c">
                                    {formatElapsed(p.avgResolutionMs)}
                                </td>
                                <td className="ir-c">
                                    {p.patrolsCompleted} / {p.patrolsAssigned}
                                </td>
                                <td className="ir-c">
                                    {formatRate(p.patrolCompletionRate)}
                                </td>
                                <td className="ir-c">{p.requestsProcessed}</td>
                                <td className="ir-c">
                                    {p.effectiveness == null
                                        ? "—"
                                        : `${p.effectiveness}%`}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <p className="ir-empty">
                Effectiveness is the average of a person's incident-resolution
                and patrol-completion rates; personnel with no assignments in
                the period are omitted. Administrator accounts are out of scope.
            </p>

            <ReportSignatures preparedBy={preparedBy} />
            <ReportFooter
                reference={reference}
                generatedLabel={fmtDateTime(generatedAt)}
            />

        </article>
    );
}

/** On-screen, paper-style preview. */
export default function SecurityPerformanceReportDocument({
    model,
    maxHeight,
}: {
    model: SecurityPerformanceReportModel;
    maxHeight?: number | string;
}) {
    return (
        <ReportScreen maxHeight={maxHeight}>
            <Sheet model={model} />
        </ReportScreen>
    );
}

/** Hidden copy on <body>; the only thing that prints. Mount once per page. */
export function SecurityPerformanceReportPrintMount({
    model,
}: {
    model: SecurityPerformanceReportModel;
}) {
    return (
        <ReportPrintMount>
            <Sheet model={model} />
        </ReportPrintMount>
    );
}
