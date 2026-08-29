import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

export type NotificationType = "Alert" | "Emergency" | "Info";
export type NotificationAudience =
    | "All"
    | "Security Personnel"
    | "Authorized Staff";

export interface MyNotification {
    notification_id: number;
    title: string;
    message: string;
    type: NotificationType;
    audience: NotificationAudience;
    sent_at: string | null;
    sent_by_name: string;
    read_at: string | null;
    acknowledged_at: string | null;
}

export interface NotificationHistoryItem {
    notification_id: number;
    title: string;
    message: string;
    type: NotificationType;
    audience: NotificationAudience;
    status: "Scheduled" | "Sent";
    scheduled_for: string | null;
    sent_at: string | null;
    created_at: string;
    created_by_name: string;
    total_recipients: number;
    read_count: number;
    acknowledged_count: number;
}

export type SendNotificationData = {
    title: string;
    message: string;
    type: NotificationType;
    audience: NotificationAudience;
    scheduled_for?: string | null;
};

interface NotificationStore {
    myNotifications: MyNotification[];
    unreadCount: number;
    unacknowledgedCount: number;

    history: NotificationHistoryItem[];

    isLoading: boolean;
    isSending: boolean;
    error: string | null;

    getMyNotifications: () => Promise<void>;
    markRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    acknowledge: (id: number) => Promise<boolean>;

    sendNotification: (data: SendNotificationData) => Promise<boolean>;
    getHistory: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    myNotifications: [],
    unreadCount: 0,
    unacknowledgedCount: 0,
    history: [],
    isLoading: false,
    isSending: false,
    error: null,

    getMyNotifications: async () => {
        try {
            const res = await AxiosInstance.get("/notifications/my");
            set({
                myNotifications: res.data.notifications,
                unreadCount: res.data.unreadCount,
                unacknowledgedCount: res.data.unacknowledgedCount,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            set({
                error:
                    err.response?.data.message ??
                    "Failed to fetch notifications.",
            });
        }
    },

    markRead: async (id) => {
        try {
            await AxiosInstance.put(`/notifications/${id}/read`);
            set((state) => ({
                myNotifications: state.myNotifications.map((n) =>
                    n.notification_id === id && !n.read_at
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch {
            /* non-critical */
        }
    },

    markAllRead: async () => {
        try {
            await AxiosInstance.put("/notifications/read-all");
            set((state) => ({
                myNotifications: state.myNotifications.map((n) =>
                    n.read_at
                        ? n
                        : { ...n, read_at: new Date().toISOString() }
                ),
                unreadCount: 0,
            }));
        } catch {
            /* non-critical */
        }
    },

    acknowledge: async (id) => {
        try {
            await AxiosInstance.put(`/notifications/${id}/acknowledge`);
            const now = new Date().toISOString();
            set((state) => ({
                myNotifications: state.myNotifications.map((n) =>
                    n.notification_id === id
                        ? {
                              ...n,
                              acknowledged_at: n.acknowledged_at ?? now,
                              read_at: n.read_at ?? now,
                          }
                        : n
                ),
                unacknowledgedCount: Math.max(
                    0,
                    state.unacknowledgedCount - 1
                ),
            }));
            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            set({
                error:
                    err.response?.data.message ??
                    "Failed to acknowledge notification.",
            });
            return false;
        }
    },

    sendNotification: async (data) => {
        try {
            set({ isSending: true, error: null });
            await AxiosInstance.post("/notifications/send", data);
            set({ isSending: false });
            await get().getHistory();
            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            set({
                isSending: false,
                error:
                    err.response?.data.message ??
                    "Failed to send notification.",
            });
            return false;
        }
    },

    getHistory: async () => {
        try {
            set({ isLoading: true, error: null });
            const res = await AxiosInstance.get("/notifications/history");
            set({ history: res.data.notifications, isLoading: false });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch notification history.",
            });
        }
    },
}));
