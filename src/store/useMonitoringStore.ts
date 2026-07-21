import AxiosInstance from "@/api/AxiosInstance";
import { create } from "zustand";
import { AxiosError } from "axios";

export interface MonitoringSchedule {
    schedule_id: number;
    personnel_id: number;
    user_id: number;

    // Assigned Security Personnel
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    role:string;

    // Assigned By Administrator
    assigned_by_id: number | null;
    assigned_by_first_name: string | null;
    assigned_by_middle_name: string | null;
    assigned_by_last_name: string | null;
    assigned_by_username: string | null;
    assigned_by_role: string | null;

    assigned_area: string;

    schedule_date: string;
    start_time: string;
    end_time: string;

    status: "Pending" | "Ongoing" | "Completed" | "Cancelled";

    remarks: string;

    created_at: string;
    updated_at: string;
}

export interface CreateScheduleData {
    user_id: number;
    assigned_area: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    remarks: string;
}

export interface UpdateScheduleData {
    user_id: number;
    assigned_area: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    remarks: string;
}

type ResponseData = {
    success: boolean;
    message: string;
};

type MonitoringStore = {
    schedules: MonitoringSchedule[];
    selectedSchedule: MonitoringSchedule | null;
    loading: boolean;   

    mySchedules: MonitoringSchedule[];

    getMyMonitoringSchedules: () => Promise<void>;

    createMonitoringSchedule: ( data: CreateScheduleData) => Promise<ResponseData>;

    getMonitoringSchedules: () => Promise<void>;

    getMonitoringScheduleById: (schedule_id: number) => Promise<void>;

    updateMonitoringSchedule: (schedule_id: number,data: UpdateScheduleData) => Promise<ResponseData>;

    deleteMonitoringSchedule: (schedule_id: number) => Promise<ResponseData>;

    updateMonitoringScheduleStatus: (schedule_id: number, status: string) => Promise<ResponseData>;
};

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
    schedules: [],
    selectedSchedule: null,
    loading: false, 

    mySchedules: [],



    getMyMonitoringSchedules: async () => {
    set({ loading: true });

    try {
        const res = await AxiosInstance.get(
            "/monitoring/getMySchedules"
        );

        set({
            mySchedules: res.data.schedules,
        });

    } finally {
        set({ loading: false });
    }
},

    getMonitoringSchedules: async () => {
        set({ loading: true });

        try {
            const res = await AxiosInstance.get("/monitoring/getAll");

            set({
                schedules: res.data.schedules,
            });
        } finally {
            set({ loading: false });
        }
    },

    getMonitoringScheduleById: async (schedule_id) => {
        set({ loading: true });

        try {
            const res = await AxiosInstance.get(
                `/monitoring/schedules/${schedule_id}`
            );

            set({
                selectedSchedule: res.data.schedule,
            });
        } finally {
            set({ loading: false });
        }
    },

  createMonitoringSchedule: async (data) => {
    set({ loading: true });

    try {
        const res = await AxiosInstance.post(
            "/monitoring/create",
            data
        );

        await get().getMonitoringSchedules();

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
                "Failed to create monitoring schedule.",
        };
    } finally {
        set({ loading: false });
    }
},
    updateMonitoringSchedule: async (schedule_id, data) => {
        set({ loading: true });
        try {
            const res = await AxiosInstance.put(
                `/monitoring/update/${schedule_id}`,
                data
            );

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
                    "Failed to update monitoring schedule.",
            };
        }
    },

    deleteMonitoringSchedule: async (schedule_id) => {
        set({ loading: true });
        try {
            const res = await AxiosInstance.delete(
                `/monitoring/delete/${schedule_id}`
            );

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
                    "Failed to delete monitoring schedule.",
            };
        }
        finally{
            set({ loading: false });
        }
    },

    updateMonitoringScheduleStatus: async (
        schedule_id,
        status
    ) => {
           
            set({ loading: true })
        try {
            const res = await AxiosInstance.patch(
                `/monitoring/update-status/${schedule_id}`,
                { status }
            );

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
                    "Failed to update monitoring schedule status.",
            };
          
        } finally{
            set({ loading: false });
           }
    },
}));