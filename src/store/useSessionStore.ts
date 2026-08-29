import { create } from "zustand";

interface SessionState {
    expired: boolean;
    setExpired: (expired: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    expired: false,
    setExpired: (expired) => set({ expired }),
}));
