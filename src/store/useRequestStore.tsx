import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export interface RequestAccess {
    request_id: number;
    request_number: string;

    requested_by: number;
    requested_by_name: string;

    first_name: string;
    middle_name: string | null;
    last_name: string;

    id_type: string | null;
    id_image: string | null;

    purpose: string;

    status: "Pending" | "Approved" | "Rejected";

    approved_by: number | null;
    approved_by_name: string | null;

    approved_at: string | null;
    created_at: string;
    updated_at: string;
}

type CreateRequestData = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    id_type?: string;
    id_image?: File | null;
    purpose: string;
};

interface RequestStore {
    requests: RequestAccess[];
    myRequests: RequestAccess[];

    isLoading: boolean;
    error: string | null;

    createRequest: (
        data: CreateRequestData
    ) => Promise<boolean>;

    getAllRequests: () => Promise<void>;

    getMyRequests: () => Promise<void>;

    approveRequest: (
        requestId: number
    ) => Promise<boolean>;

    rejectRequest: (
        requestId: number
    ) => Promise<boolean>;
}

export const useRequestStore = create<RequestStore>(
    (set, get) => ({
        requests: [],
        myRequests: [],

        isLoading: false,
        error: null,

        createRequest: async (data) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const formData = new FormData();

                formData.append("first_name", data.first_name);
                formData.append("middle_name", data.middle_name ?? "");
                formData.append("last_name", data.last_name);
                formData.append("id_type", data.id_type ?? "");
                formData.append("purpose", data.purpose);

                if (data.id_image) {
                    formData.append("id_image", data.id_image);
                }

                const res = await AxiosInstance.post(
                    "/access-request/create",
                    formData
                );

                set((state) => ({
                    myRequests: [
                        res.data.request,
                        ...state.myRequests,
                    ],
                    isLoading: false,
                }));

                return true;
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to create request.",
                });

                return false;
            }
        },

        getAllRequests: async () => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.get(
                    "/access-request/get-all"
                );

                set({
                    requests: res.data.requests,
                    isLoading: false,
                });
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to fetch requests.",
                });
            }
        },

        getMyRequests: async () => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.get(
                    "/access-request/get-my-requests"
                );

                set({
                    myRequests: res.data.requests,
                    isLoading: false,
                });
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to fetch your requests.",
                });
            }
        },

        approveRequest: async (requestId) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                await AxiosInstance.put(
                    `/access-request/approve/${requestId}`
                );

                await get().getAllRequests();

                set({
                    isLoading: false,
                });

                return true;
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to approve request.",
                });

                return false;
            }
        },

        rejectRequest: async (requestId) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                await AxiosInstance.put(
                    `/access-request/reject/${requestId}`
                );

                await get().getAllRequests();

                set({
                    isLoading: false,
                });

                return true;
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to reject request.",
                });

                return false;
            }
        },
    })
);