import { useRequestStore } from "@/store/useRequestStore";
import { useEffect } from "react";

export const useRequest = () => {
    const {
        isLoading,
        error,
        requests,
        createRequest,
        myRequests,
        pendingRequests,
        getAllRequests,
        getMyRequests,
        getPendingRequests,
        approveRequest,
        rejectRequest,
        checkOutVisitor,
    } = useRequestStore();

    useEffect(() => {
        getAllRequests();
        getMyRequests();
        getPendingRequests();
    //eslint-disable-next-line
    }, []);

    return {
        isLoading,
        error,
        requests,
        createRequest,
        myRequests,
        pendingRequests,
        approveRequest,
        rejectRequest,
        checkOutVisitor,
    };
};
