import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export type ActivityAction =
    | "Login"
    | "Logout"
    | "Visitor Request"
    | "Incident Report";

export interface ActivityLog {
    activity_id: number;
    user_id: number | null;
    user_name: string;
    role: string | null;
    action: ActivityAction;
    reference: string | null;
    detail: string | null;
    ip_address: string | null;
    created_at: string;
}

type ActivityQuery = {
    from?: string;
    to?: string;
    action?: string;
    role?: string;
};

interface ActivityStore {
    logs: ActivityLog[];
    isLoading: boolean;
    error: string | null;
    getActivityLogs: (params?: ActivityQuery) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set) => ({
    logs: [],
    isLoading: false,
    error: null,

    getActivityLogs: async (params) => {
        try {
            set({ isLoading: true, error: null });

            const res = await AxiosInstance.get("/activity/logs", { params });

            set({ logs: res.data.logs, isLoading: false });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch activity logs.",
            });
        }
    },
}));
