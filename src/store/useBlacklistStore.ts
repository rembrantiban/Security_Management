import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export interface BlacklistEntry {
    blacklist_id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    reason: string;
    is_active: boolean;
    created_at: string;

    blacklisted_by: number | null;
    blacklisted_by_name: string | null;
}

type AddToBlacklistData = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    reason: string;
};

interface BlacklistStore {
    blacklist: BlacklistEntry[];
    isLoading: boolean;
    error: string | null;

    getBlacklist: () => Promise<void>;
    addToBlacklist: (data: AddToBlacklistData) => Promise<boolean>;
    removeFromBlacklist: (blacklistId: number) => Promise<boolean>;
}

export const useBlacklistStore = create<BlacklistStore>((set, get) => ({
    blacklist: [],
    isLoading: false,
    error: null,

    getBlacklist: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const { data } = await AxiosInstance.get("/blacklist/get-all");

            set({
                blacklist: data.blacklist,
                isLoading: false,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ??
                    "Failed to fetch blacklist.",
            });
        }
    },

    addToBlacklist: async (data) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.post("/blacklist/add", data);

            await get().getBlacklist();

            set({
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ??
                    "Failed to blacklist visitor.",
            });

            return false;
        }
    },

    removeFromBlacklist: async (blacklistId) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(`/blacklist/remove/${blacklistId}`);

            set((state) => ({
                blacklist: state.blacklist.filter(
                    (entry) => entry.blacklist_id !== blacklistId
                ),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ??
                    "Failed to update blacklist.",
            });

            return false;
        }
    },
}));
