import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export interface User {
    user_id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    status: boolean;
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

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    getMeLoading:boolean;
    isFetchingUsers: boolean;
    error: string | null;
    users: User[];
    login: (login: string, password: string) => Promise<boolean>;
    register: (date: RegisterData) => Promise<boolean>;

    logout: () => Promise<void>;

    getCurrentUser: () => Promise<void>;
    getUserStatistics: () => Promise<void>;

    clearError: () => void;
    stats: UserStatistics;

    getAllUsers: () => Promise<void>;

}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getMeLoading:false,
    isFetchingUsers: false,
    error: null,
    users: [],
    stats: {
        totalUsers: 0,
        activeUsers: 0,
        administrators: 0,
        disabledUsers: 0,
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

            return true;
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