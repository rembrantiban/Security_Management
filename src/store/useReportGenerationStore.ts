import { create } from "zustand";
import { AxiosError } from "axios";
import AxiosInstance from "@/api/AxiosInstance";

export type ReportExportFormat = "PDF" | "Excel";

export interface ReportGeneration {
    report_generation_id: number;
    report_key: string;
    report_ref: string;
    title: string;
    export_format: ReportExportFormat;
    date_from: string | null;
    date_to: string | null;
    range_label: string;
    record_count: number | null;
    generated_by: number | null;
    generated_by_name: string | null;
    created_at: string;
}

export interface LogReportGenerationInput {
    report_key: string;
    report_ref: string;
    title: string;
    export_format: ReportExportFormat;
    date_from?: string | null;
    date_to?: string | null;
    range_label: string;
    record_count?: number | null;
}

interface ReportGenerationStore {
    history: ReportGeneration[];
    isFetching: boolean;
    error: string | null;

    getReportGenerations: (limit?: number) => Promise<void>;
    logReportGeneration: (input: LogReportGenerationInput) => Promise<void>;
}

export const useReportGenerationStore = create<ReportGenerationStore>((set) => ({
    history: [],
    isFetching: false,
    error: null,

    getReportGenerations: async (limit) => {
        try {
            set({ isFetching: true, error: null });

            const res = await AxiosInstance.get("/reports/generations", {
                params: limit ? { limit } : undefined,
            });

            set({
                history: res.data.data ?? [],
                isFetching: false,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isFetching: false,
                error:
                    err.response?.data?.message ??
                    "Failed to load recent reports.",
            });
        }
    },

    logReportGeneration: async (input) => {
        try {
            const res = await AxiosInstance.post(
                "/reports/generations",
                input
            );

            const entry: ReportGeneration | undefined = res.data.data;
            if (!entry) return;

            set((state) => ({
                history: [entry, ...state.history],
            }));
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            // A failed audit write must not break the report the user just ran.
            set({
                error:
                    err.response?.data?.message ??
                    "Failed to record report generation.",
            });
        }
    },
}));
