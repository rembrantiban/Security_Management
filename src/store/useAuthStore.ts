import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export interface Users {
    user_id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    status: boolean;

    on_duty: boolean;
    duty_start: string | null;
    duty_end: string | null;

    created_at: string;
    last_login: string;
}


export interface RegisterData {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    role: string,
}

export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    administrators: number;
    disabledUsers: number;
}

export interface UpdateUserData {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    password?: string;
}

export interface DutyScheduleData {
    duty_start: string;
    duty_end: string;
}

interface AuthState {
    user: Users | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    getMeLoading: boolean;
    isFetchingUsers: boolean;
    error: string | null;
    users: Users[];
    securityPersonnel: Users[],
    login: (login: string, password: string) => Promise<Users | null>;
    register: (date: RegisterData) => Promise<boolean>;
    selectedUserById: Users | null;
    logout: () => Promise<void>;

    getCurrentUser: () => Promise<void>;
    getUserStatistics: () => Promise<void>;

    clearError: () => void;
    stats: UserStatistics;

    getAllUsers: () => Promise<void>;
    getSecurityPersonnel: () => Promise<void>;
    createUserByAdmin: (data: RegisterData) => Promise<boolean>;
    updateUser: (user_id: number, data: UpdateUserData) => Promise<{ success: boolean; message: string }>;
    getUserById: (user_id: number) => Promise<boolean>;
    deleteUser: (user_id: number) => Promise<boolean>;
    updateUserStatus: (user_id: number, status: boolean) => Promise<boolean>;

    setDutySchedule: (user_id: number, data: DutyScheduleData) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    selectedUserById: null,
    isAuthenticated: false,
    isLoading: false,
    getMeLoading: false,
    isFetchingUsers: false,
    error: null,
    users: [],
    stats: {
        totalUsers: 0,
        activeUsers: 0,
        administrators: 0,
        disabledUsers: 0,
    },
    securityPersonnel: [],


    getUserById: async (user_id) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const { data } = await AxiosInstance.get(
                `/auth/user/${user_id}`
            );

            set({
                selectedUserById: data.user,
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch user.",
            });

            return false;
        }
    },
    setDutySchedule: async (user_id, data) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const response = await AxiosInstance.put(
                `/auth/set-duty-schedule/${user_id}`,
                data
            );

            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === user_id
                        ? {
                            ...user,
                            duty_start: response.data.user.duty_start,
                            duty_end: response.data.user.duty_end,
                            on_duty: response.data.user.on_duty,
                        }
                        : user
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
                    "Failed to assign duty schedule.",
            });

            return false;
        }
    },

    getSecurityPersonnel: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const response = await AxiosInstance.get("/auth/security-personnel");
            set({
                isLoading: false,
                securityPersonnel: response.data.personnel,
                error: null,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ??
                    "Failed to fetch security personnel",
            });
        }
    },

    updateUserStatus: async (user_id: number, status: boolean
    ) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const response = await AxiosInstance.put(
                `/auth/update-user-status/${user_id}`,
                { status }
            );

            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === user_id
                        ? {
                            ...user,
                            status: response.data.user.status,
                        }
                        : user
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
                    "Failed to update user status",
            });

            return false;
        }
    },
    deleteUser: async (user_id: number) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.delete(
                `/auth/delete-user/${user_id}`
            );

            set((state) => ({
                users: state.users.filter(
                    (user) => user.user_id !== user_id
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
                    "Failed to delete user",
            });

            return false;
        }
    },
    updateUser: async (user_id, data) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const { data: response } = await AxiosInstance.put(
                `/auth/update-user/${user_id}`,
                data
            );

            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === user_id
                        ? response.user
                        : user
                ),

                selectedUserById:
                    state.selectedUserById?.user_id === user_id
                        ? response.user
                        : state.selectedUserById,

                isLoading: false,
                error: null,
            }));

            return {
                success: true,
                message: "",
            };
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            const message =
                err.response?.data?.message ??
                "Failed to update user";

            set({
                isLoading: false,
                error: message,
            });

            return {
                success: false,
                message,
            };
        }
    },
    createUserByAdmin: async (data: RegisterData) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const response = await AxiosInstance.post(
                "/auth/create-user",
                data
            );

            set((state) => ({
                users: [response.data.user, ...state.users],
                isLoading: false,
            }));

            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ||
                    "Failed to create user",
            });

            return false;
        }
    },


    getAllUsers: async () => {
        try {
            set({
                isFetchingUsers: true,
                error: null,
            });

            const { data } = await AxiosInstance.get("/auth/get-all-users");

            set({
                users: data.users,
                isFetchingUsers: false,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isFetchingUsers: false,
                error:
                    err.response?.data?.message ||
                    "Failed to fetch users",
            });
        }
    },

    getUserStatistics: async () => {
        try {
            const { data } = await AxiosInstance.get(
                "/auth/statistics"
            );

            set({
                stats: data.stats,
            });
        } catch (error) {
            console.error("Failed to fetch user statistics", error);
        }
    },

    register: async (data: RegisterData) => {
        try {
            set({ isLoading: true, error: null });

            await AxiosInstance.post("/auth/register", data);
            set({ isLoading: false });

            set({ isLoading: false, error: null });

            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            set({ isLoading: false, error: err.response?.data?.message || "Registration failed" });
            return false;
        }
    },
    login: async (login, password) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const { data } = await AxiosInstance.post(
                "/auth/login",
                {
                    login,
                    password,
                }
            );

            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
            });

            return data.user;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data?.message ||
                    "Login failed",
            });

            return false;
        }
    },

    logout: async () => {
        try {
            await AxiosInstance.post("/auth/logout");

            set({
                user: null,
                isAuthenticated: false,
            });
        } catch (error) {
            console.error(error);
        }
    },

    getCurrentUser: async () => {
        console.log("getCurrentUser called");

        try {
            set({ getMeLoading: true });

            const { data } = await AxiosInstance.get("/auth/me");

            set({
                user: data.user,
                isAuthenticated: true,
                getMeLoading: false,
            });
        } catch {
            set({
                user: null,
                isAuthenticated: false,
                getMeLoading: false,
            });
        }
    },

    clearError: () =>
        set({
            error: null,
        }),
}));