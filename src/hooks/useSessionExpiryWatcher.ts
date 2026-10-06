import { useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";

// setTimeout overflows above ~24.8 days; re-check at most this often.
const MAX_TIMER_MS = 2_147_483_647;

/**
 * Flags the session as expired the moment its server-issued expiry passes,
 * so the user is told immediately instead of on their next failed request.
 * Also re-checks when the tab regains focus, since browsers throttle timers
 * in background tabs and a sleeping laptop can skip them entirely.
 */
export function useSessionExpiryWatcher(): void {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const expiresAt = useSessionStore((state) => state.expiresAt);
    const expired = useSessionStore((state) => state.expired);
    const setExpired = useSessionStore((state) => state.setExpired);

    useEffect(() => {
        if (!isAuthenticated || expiresAt === null || expired) return;

        const checkExpiry = (): boolean => {
            if (Date.now() >= expiresAt) {
                setExpired(true);
                return true;
            }
            return false;
        };

        if (checkExpiry()) return;

        const timer = window.setTimeout(
            checkExpiry,
            Math.min(expiresAt - Date.now(), MAX_TIMER_MS)
        );

        const handleVisibility = () => {
            if (document.visibilityState === "visible") checkExpiry();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [isAuthenticated, expiresAt, expired, setExpired]);
}
