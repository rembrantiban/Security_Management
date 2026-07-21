import { create } from "zustand";
import { AxiosError } from "axios";
import AxiosInstance from "@/api/AxiosInstance";

export interface Permission {
    permission_id: number;
    module_name: string;
    permission_name: string;
}

type PermissionInput = {
    module_name: string;
    permission_name: string;
};

interface PermissionStore {
    permissions: Permission[];
    isLoading: boolean;
    error: string | null;

    getPermissions: () => Promise<void>;

    createPermission: (
        data: PermissionInput
    ) => Promise<boolean>;

    updatePermission: (
        permission_id: number,
        data: PermissionInput
    ) => Promise<boolean>;

    deletePermission: (
        permission_id: number
    ) => Promise<boolean>;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
        permissions: [],
        isLoading: false,
        error: null,

        getPermissions: async () => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.get(
                    "/permissions/list"
                );

                set({
                    permissions: res.data.permissions,
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
                        "Failed to fetch permissions.",
                });
            }
        },

        createPermission: async (data) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.post(
                    "/permissions/create",
                    data
                );

                set((state) => ({
                    permissions: [
                        res.data.permission,
                        ...state.permissions,
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
                        "Failed to create permission.",
                });

                return false;
            }
        },

        updatePermission: async (
            permission_id,
            data
        ) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.put(
                    `/permissions/update/${permission_id}`,
                    data
                );

                set((state) => ({
                    permissions: state.permissions.map(
                        (permission) =>
                            permission.permission_id ===
                            permission_id
                                ? res.data.permission
                                : permission
                    ),
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
                        "Failed to update permission.",
                });

                return false;
            }
        },

        deletePermission: async (
            permission_id
        ) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                await AxiosInstance.delete(
                    `/permissions/delete/${permission_id}`
                );

                set((state) => ({
                    permissions: state.permissions.filter(
                        (permission) =>
                            permission.permission_id !==
                            permission_id
                    ),
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
                        "Failed to delete permission.",
                });

                return false;
            }
        },
    })
);