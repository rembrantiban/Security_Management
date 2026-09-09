import { create } from "zustand";
import { AxiosError } from "axios";
import AxiosInstance from "@/api/AxiosInstance";

export type SystemComponentStatus = "Operational" | "Degraded" | "Offline";

export interface SystemComponent {
    id: string;
    name: string;
    status: SystemComponentStatus;
    latency_ms: number | null;
    detail: string;
}

export interface SystemStatus {
    checked_at: string;
    uptime_seconds: number;
    overall: SystemComponentStatus;
    operational: number;
    total: number;
    components: SystemComponent[];
}

interface SystemStatusStore {
    status: SystemStatus | null;
    /** Client → API round-trip of the last successful fetch, in ms. */
    roundTripMs: number | null;
    isLoading: boolean;
    error: string | null;

    getSystemStatus: () => Promise<void>;
}

export const useSystemStatusStore = create<SystemStatusStore>((set) => ({
    status: null,
    roundTripMs: null,
    isLoading: false,
    error: null,

    getSystemStatus: async () => {
        try {
            set({ isLoading: true, error: null });

            const start = performance.now();
            const res = await AxiosInstance.get("/system/status");
            const roundTripMs = Math.round(performance.now() - start);

            set({
                status: res.data.data ?? null,
                roundTripMs,
                isLoading: false,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ??
                    "Unable to reach the system status service.",
            });
        }
    },
}));
