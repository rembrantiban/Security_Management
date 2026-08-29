import { useIncidentStore } from "@/store/useIncidentReportStore"
import { useEffect } from "react";


export const useIncidentReport = () => {
    const { getMyIncidentReports,
            getAllIncidents,
            createIncident,
            isLoading,
            error,
            incidents,
            myIncidents,
            assignIncident,
            reAssignIncident,
            closeIncident,
            stats,
            getIncidentStatistics,
            getMyAssignedIncidents,
            fetchMyAssignedIncidents,
            fetchPersonnelDashboardStats,
            personnelStats,
            resolvedIncident,
            updateIncident,
            archivedIncidents,
            isFetchingArchived,
            getArchivedIncidents,
            archiveIncident,
            restoreIncident
     } = useIncidentStore();

     useEffect(() => {
         getMyIncidentReports();
         getAllIncidents();
         getIncidentStatistics();
         fetchMyAssignedIncidents();
         fetchPersonnelDashboardStats();
         // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

    return { getMyIncidentReports,
             getAllIncidents,
             createIncident,
             isLoading,
             error,
             incidents,
             myIncidents,
             assignIncident,
             reAssignIncident,
             closeIncident,
             stats,
             getMyAssignedIncidents,
             personnelStats,
             resolvedIncident,
             updateIncident,
             archivedIncidents,
             isFetchingArchived,
             getArchivedIncidents,
             archiveIncident,
             restoreIncident
     };
};
