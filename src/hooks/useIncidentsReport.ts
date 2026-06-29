import { useIncidentStore } from "@/store/useIncidentReportStore"
import { useEffect } from "react";


export const useIncidentReport = () => {
    const { getMyIncidentReports,
            getAllIncidents,
            createIncident,
            isLoading,
            incidents,
            myIncidents,
            assignIncident,
            reAssignIncident,
            closeIncident,
     } = useIncidentStore();

     useEffect(() => {
         getMyIncidentReports();
         getAllIncidents();
         // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

    return { getMyIncidentReports,
             getAllIncidents,
             createIncident,
             isLoading,
             incidents,
             myIncidents,
             assignIncident,
             reAssignIncident,
             closeIncident
     };
};
