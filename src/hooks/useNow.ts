import { useEffect, useState } from "react";

/** Returns the current time, refreshed every `intervalMs` while `enabled`. */
export const useNow = (intervalMs = 30_000, enabled = true): Date => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (!enabled) return;

        const tick = () => setNow(new Date());
        // Sync immediately when (re-)enabled, then on every interval.
        const timeoutId = window.setTimeout(tick, 0);
        const intervalId = window.setInterval(tick, intervalMs);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
        };
    }, [intervalMs, enabled]);

    return now;
};
