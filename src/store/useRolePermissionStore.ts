import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export type UserRole =
    | "Administrator"
    | "Security Personnel"
    | "IT System Administrator"
    | "Authorized Staff";

export interface Permission {
    permission_id: number;
    permission_name: string;
    module_name: string;
}

export interface RolePermission {
    role_permission_id: number;
    role: UserRole;

    permission_id: number;
    permission_name: string;
    module: string;
    description?: string;

    created_at: string;
}

interface RolePermissionStore {
    isLoading: boolean;
    error: string | null;

    rolePermissions: RolePermission[];

    rolePermissionsList: Permission[];

    permissionMatrix: Record<UserRole, number[]>;

    getAllRolePermissions: () => Promise<void>;

    getRolePermissions: (
        role: UserRole
    ) => Promise<Permission[]>;

    getPermissionMatrix: () => Promise<void>;

    assignPermission: (
        role: UserRole,
        permission_id: number
    ) => Promise<boolean>;

    removePermission: (
        role: UserRole,
        permission_id: number
    ) => Promise<boolean>;

    updateRolePermissions: (
        role: UserRole,
        permission_ids: number[]
    ) => Promise<boolean>;
}

export const useRolePermissionStore =
    create<RolePermissionStore>((set, get) => ({
        isLoading: false,

        error: null,

        rolePermissions: [],

        rolePermissionsList: [],

        permissionMatrix: {
            Administrator: [],
            "Security Personnel": [],
            "IT System Administrator": [],
            "Authorized Staff": [],
        },

        getAllRolePermissions: async () => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res =
                    await AxiosInstance.get(
                        "/role-permissions/get-all"
                    );

                set({
                    rolePermissions:
                        res.data.permissions,

                    isLoading: false,
                });
            } catch (error) {
                const err =
                    error as AxiosError<{
                        message: string;
                    }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to fetch role permissions.",
                });
            }
        },

        getRolePermissions: async (
            role
        ): Promise<Permission[]> => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res = await AxiosInstance.get(
                    `/role-permissions/get/${encodeURIComponent(role)}`
                );

                set({
                    rolePermissionsList: res.data.permissions,
                    isLoading: false,
                });

                return res.data.permissions;
            } catch (error) {
                const err = error as AxiosError<{
                    message: string;
                }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to fetch role permissions.",
                });

                return [];
            }
        },

        getPermissionMatrix: async () => {
            try {
                const res =
                    await AxiosInstance.get(
                        "/role-permissions/matrix"
                    );

                set({
                    permissionMatrix:
                        res.data.matrix,
                });
            } catch (error) {
                console.error(error);
            }
        },

        assignPermission: async (
            role,
            permission_id
        ) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                await AxiosInstance.post(
                    "/role-permissions/assign",
                    {
                        role,
                        permission_id,
                    }
                );

                await get().getRolePermissions(
                    role
                );

                await get().getPermissionMatrix();

                set({
                    isLoading: false,
                });

                return true;
            } catch (error) {
                const err =
                    error as AxiosError<{
                        message: string;
                    }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to assign permission.",
                });

                return false;
            }
        },

        removePermission: async (
            role,
            permission_id
        ) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                await AxiosInstance.delete(
                    `/role-permissions/delete/${encodeURIComponent(
                        role
                    )}/${permission_id}`
                );

                await get().getRolePermissions(
                    role
                );

                await get().getPermissionMatrix();

                set({
                    isLoading: false,
                });

                return true;
            } catch (error) {
                const err =
                    error as AxiosError<{
                        message: string;
                    }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to remove permission.",
                });

                return false;
            }
        },

        updateRolePermissions: async (
            role,
            permission_ids
        ) => {
            try {
                set({
                    isLoading: true,
                    error: null,
                });

                const res =
                    await AxiosInstance.put(
                        `/role-permissions/update/${encodeURIComponent(
                            role
                        )}`,
                        {
                            permission_ids,
                        }
                    );

                set({
                    rolePermissionsList:
                        res.data.permissions,

                    permissionMatrix: {
                        ...get()
                            .permissionMatrix,
                        [role]:
                            permission_ids,
                    },

                    isLoading: false,
                });

                return true;
            } catch (error) {
                const err =
                    error as AxiosError<{
                        message: string;
                    }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to update permissions.",
                });

                return false;
            }
        },
    }));