import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";
import { useRequestStore, type BlacklistMatch } from "./useRequestStore";

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

export type VisitorNameQuery = {
    first_name: string;
    middle_name?: string;
    last_name: string;
};

interface BlacklistStore {
    blacklist: BlacklistEntry[];
    isLoading: boolean;
    error: string | null;

    getBlacklist: () => Promise<void>;
    addToBlacklist: (data: AddToBlacklistData) => Promise<boolean>;
    removeFromBlacklist: (blacklistId: number) => Promise<boolean>;
    /**
     * Screens a visitor name against the active blacklist.
     * Resolves to the match, or null when the visitor is clear.
     * Rejects on network/server failure so callers can fail open
     * (the server still enforces the rule on submit).
     */
    checkVisitor: (
        name: VisitorNameQuery,
        signal?: AbortSignal
    ) => Promise<BlacklistMatch | null>;
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

            // Blacklisting rejects the visitor's pending requests server-side,
            // so refresh the request lists alongside the blacklist.
            const requestStore = useRequestStore.getState();

            await Promise.all([
                get().getBlacklist(),
                requestStore.getAllRequests(),
                requestStore.getPendingRequests(),
            ]);

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

    checkVisitor: async (name, signal) => {
        const { data } = await AxiosInstance.get<{
            data: { blacklisted: boolean; blacklist: BlacklistMatch | null };
        }>("/blacklist/check", { params: name, signal });

        return data.data.blacklisted ? data.data.blacklist : null;
    },
}));
