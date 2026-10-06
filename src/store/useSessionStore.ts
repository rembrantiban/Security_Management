import { create } from "zustand";

interface SessionState {
    /** True once the session has ended; drives the "Session Expired" modal. */
    expired: boolean;
    /** Epoch milliseconds when the current session ends, or null if unknown / signed out. */
    expiresAt: number | null;
    setExpired: (expired: boolean) => void;
    /** Records the server-issued expiry (ISO string) for a freshly authenticated session. */
    startSession: (expiresAtIso: string | null | undefined) => void;
    /** Clears session tracking on logout. */
    endSession: () => void;
}

const parseExpiry = (iso: string | null | undefined): number | null => {
    if (!iso) return null;
    const time = new Date(iso).getTime();
    return Number.isNaN(time) ? null : time;
};

export const useSessionStore = create<SessionState>((set) => ({
    expired: false,
    expiresAt: null,
    setExpired: (expired) => set({ expired }),
    startSession: (expiresAtIso) =>
        set({ expiresAt: parseExpiry(expiresAtIso), expired: false }),
    endSession: () => set({ expiresAt: null }),
}));
