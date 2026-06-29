import { useToastStore } from "@/store/useToastStore";

export const useToast = () => {
  const {
    open,
    type,
    title,
    message,
    duration,
    showToast,
    closeToast,
  } = useToastStore();

  return {
    open,
    type,
    title,
    message,
    duration,
    showToast,
    closeToast,
  };
};