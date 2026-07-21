import { create } from "zustand";
import { AxiosError } from "axios";
import AxiosInstance from "@/api/AxiosInstance";

type ResponseData = {
    success: boolean;
    message: string;
};

export interface PatrolLog {
    patrol_log_id: number;
    schedule_id: number;
    user_id: number;

    area_patrolled: string;

    patrol_start: string | null;
    patrol_end: string | null;

    observations: string | null;

    status:
        | "Pending"
        | "Ongoing"
        | "Completed"
        | "Missed";

    created_at: string;
    updated_at: string;

    schedule_date: string;
    start_time: string;
    end_time: string;

    personnel_name: string;
}

type PatrolStore = {
    patrols: PatrolLog[];
    selectedPatrol: PatrolLog | null;
    completedPatrols: PatrolLog[];
    isloading: boolean;

    getMyPatrols: () => Promise<void>;
    getMyCompletedPatrols: () => Promise<void>;
    getPatrolById: (patrol_log_id: number) => Promise<void>;

    startPatrol: ( schedule_id: number) => Promise<ResponseData>;
};

export const usePatrolStore = create<PatrolStore>((set) => ({
    patrols: [],
    selectedPatrol: null,
    isloading: false,
    completedPatrols: [],

    getMyCompletedPatrols: async () => {
    set({ isloading: true });

    try {
        const res = await AxiosInstance.get(
            "/patrol/my-completed"
        );

        set({
            completedPatrols: res.data.patrols,
        });
    } catch (error) {
        console.error(error);
    } finally {
        set({
            isloading: false,
        });
    }
},
    getMyPatrols: async () => {
        set({ isloading: true });

        try {
            const res = await AxiosInstance.get(
                "/patrol/my-patrols"
            );

            set({
                patrols: res.data.patrols,
            });

        } finally {
            set({ isloading: false });
        }
    },

    getPatrolById: async (patrol_log_id) => {
        set({ isloading: true });

        try {
            const res = await AxiosInstance.get(
                `/patrol/${patrol_log_id}`
            );

            set({
                selectedPatrol: res.data.patrol,
            });

        } finally {
            set({ isloading: false });
        }
    },

    startPatrol: async (schedule_id: number) => {
    set({ isloading: true });

    try {
        const res = await AxiosInstance.patch(
            `/patrol/start/${schedule_id}`
        );

        const patrols = await AxiosInstance.get("/patrol/my-patrols");

        set({
            patrols: patrols.data.patrols,
        });

        return {
            success: true,
            message: res.data.message,
        };
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;

        return {
            success: false,
            message:
                err.response?.data?.message ??
                "Failed to start patrol.",
        };
    } finally {
        set({ isloading: false });
    }
},
}));