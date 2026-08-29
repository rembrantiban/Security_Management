import { useEffect } from "react";
import { useIncidentStore } from "@/store/useIncidentReportStore";

export const useStaffIncidents = () => {
    const {
        mySubmittedIncidents,
        isFetchingSubmitted,
        getMySubmittedIncidents,
        createIncident,
        isLoading,
        error,
    } = useIncidentStore();

    useEffect(() => {
        getMySubmittedIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        mySubmittedIncidents,
        isFetchingSubmitted,
        getMySubmittedIncidents,
        createIncident,
        isLoading,
        error,
    };
};
