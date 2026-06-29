import { create } from "zustand";

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

type ToastState = {
  open: boolean;
  type: ToastType;
  title: string;
  message: string;
  duration: number;

  showToast: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => void;

  closeToast: () => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  open: false,
  type: "success",
  title: "",
  message: "",
  duration: 3000,

  showToast: (
    type,
    title,
    message,
    duration = 3000
  ) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({
      open: true,
      type,
      title,
      message,
      duration,
    });

    toastTimer = setTimeout(() => {
      set({ open: false });
    }, duration);
  },

  closeToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({ open: false });
  },
}));