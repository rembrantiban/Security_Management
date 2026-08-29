import { useEffect, useState } from "react";
import PersonnelIncidentHeader from "@/components/Incident/PersonnelIncidentHeader";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";
import PersonnelIncidentTable from "@/components/Incident/PersonnelIncidentTable";
import ResolveIncidentDialog from "@/components/PersonnelDashboard/ResolveIncidentDialog";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import type { Incident } from "@/store/useIncidentReportStore";


export default function PersonnelIncidentsPage() {
    const {
        myIncidents,
        getMyIncidentReports,
    } = useIncidentReport();

    const [reportOpen, setReportOpen] = useState(false);
    const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
    const [resolveOpen, setResolveOpen] = useState(false);

    useEffect(() => {
        getMyIncidentReports();
        //eslint-disable-next-line
    }, []);

    return (
        <div className="min-h-full  ">
            <div className="space-y-2">
                <PersonnelIncidentHeader
                    onCreateIncident={() => setReportOpen(true)}
                />

                <PersonnelIncidentTable
                    incidents={myIncidents}
                    onUpdateDetails={(incident) => console.log("Update details:", incident.incident_id)}
                    onUploadEvidence={(incident) => console.log("Upload evidence:", incident.incident_id)}
                    onMarkResolved={(incident) => {
                        setResolveTarget(incident);
                        setResolveOpen(true);
                    }}
                />

                <ReportIncidentModal
                    open={reportOpen}
                    onOpenChange={setReportOpen}
                />

                <ResolveIncidentDialog
                    open={resolveOpen}
                    onOpenChange={setResolveOpen}
                    incident={resolveTarget}
                    onResolved={getMyIncidentReports}
                />
            </div>
        </div>
    );
}
