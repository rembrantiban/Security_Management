import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export type ActivityAction =
    | "Login"
    | "Logout"
    | "Register"
    | "Incident Report"
    | "Visitor Request"
    | "Access Request"
    | "Monitoring"
    | "Patrol";

/** Roles whose activity is hidden from the dashboard activity logs. */
export const HIDDEN_ACTIVITY_ROLES: readonly string[] = ["Administrator"];

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

            const logs: ActivityLog[] = (res.data.logs ?? []).filter(
                (log: ActivityLog) =>
                    !HIDDEN_ACTIVITY_ROLES.includes(log.role ?? "")
            );

            set({ logs, isLoading: false });
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
