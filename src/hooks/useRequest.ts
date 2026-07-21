import { useRequestStore } from "@/store/useRequestStore";
import { useEffect } from "react";

export const useRequest = () => {
    const {
        isLoading,
        error,
        requests,
        createRequest,
        myRequests,
        getAllRequests,
        getMyRequests,
        approveRequest,
        rejectRequest,
    } = useRequestStore();

    useEffect(() => {
        getAllRequests();
        getMyRequests();
    //eslint-disable-next-line
    }, []);

    return {
        isLoading,
        error,
        requests,
        createRequest,
        myRequests,
        approveRequest,
        rejectRequest,
    };
};