import { useState } from "react";
import PersonnelIncidentHeader from "@/components/Incident/PersonnelIncidentHeader";
import ReportIncidentModal from "@/components/Incident/ReportIncidentModal";
import PersonnelIncidentTable from "@/components/Incident/PersonnelIncidentTable";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useEffect } from "react";


export default function PersonnelIncidentsPage() {
    const {
        myIncidents,
        getMyIncidentReports,
    } = useIncidentReport();

    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        getMyIncidentReports();
        //eslint-disable-next-line
    }, []);

  

    return (
        <div className="min-h-full bg-gray-50/60 ">
            <div className="space-y-2">
                <PersonnelIncidentHeader
                    onCreateIncident={() => setReportOpen(true)}
                />

                <PersonnelIncidentTable
                    incidents={myIncidents}
                    onUpdateDetails={(incident) => console.log("Update details:", incident.incident_id)}
                    onUploadEvidence={(incident) => console.log("Upload evidence:", incident.incident_id)}
                    onMarkResolved={(incident) => console.log("Mark resolved:", incident.incident_id)}
                />

                <ReportIncidentModal
                    open={reportOpen}
                    onOpenChange={setReportOpen}
                />
            </div>
        </div>
    );
}