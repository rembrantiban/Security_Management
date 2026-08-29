import axios from "axios";
import { useSessionStore } from "@/store/useSessionStore";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// Requests where a 401 is expected/normal and should not trigger the
// "session expired" modal (e.g. checking auth on first load, or logging in/out).
const SILENT_401_PATHS = ["/auth/login", "/auth/register", "/auth/logout", "/auth/me"];

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    const isSilent = SILENT_401_PATHS.some((path) => url.includes(path));

    if (status === 401 && !isSilent) {
      useSessionStore.getState().setExpired(true);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;