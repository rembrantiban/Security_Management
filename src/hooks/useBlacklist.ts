import { useEffect } from "react";
import { useBlacklistStore } from "@/store/useBlacklistStore";

export const useBlacklist = () => {
    const {
        blacklist,
        isLoading,
        error,
        getBlacklist,
        addToBlacklist,
        removeFromBlacklist,
    } = useBlacklistStore();

    useEffect(() => {
        getBlacklist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        blacklist,
        isLoading,
        error,
        getBlacklist,
        addToBlacklist,
        removeFromBlacklist,
    };
};
