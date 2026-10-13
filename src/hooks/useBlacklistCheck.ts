import { useEffect, useState } from "react";
import { useBlacklistStore } from "@/store/useBlacklistStore";
import type { BlacklistMatch } from "@/store/useRequestStore";

const DEBOUNCE_MS = 400;

type VisitorNameInput = {
    first_name: string;
    middle_name: string;
    last_name: string;
};

type CheckResult = {
    /** Normalized name the result belongs to. */
    key: string;
    match: BlacklistMatch | null;
};

const toKey = ({ first_name, middle_name, last_name }: VisitorNameInput) =>
    [first_name, middle_name, last_name]
        .map((part) => part.trim().toLowerCase())
        .join("|");

/**
 * Live blacklist screening for a visitor name as it is typed.
 *
 * Results are keyed by the normalized name, so a stale result is never shown
 * for a name that has since changed. Network failures fail open: the server
 * re-checks the blacklist when the request is submitted.
 */
export const useBlacklistCheck = (name: VisitorNameInput, enabled = true) => {
    const checkVisitor = useBlacklistStore((state) => state.checkVisitor);
    const [result, setResult] = useState<CheckResult | null>(null);

    const firstName = name.first_name.trim();
    const middleName = name.middle_name.trim();
    const lastName = name.last_name.trim();
    const key = toKey(name);
    const canCheck = enabled && firstName !== "" && lastName !== "";

    useEffect(() => {
        if (!canCheck) return;

        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            try {
                const match = await checkVisitor(
                    {
                        first_name: firstName,
                        middle_name: middleName || undefined,
                        last_name: lastName,
                    },
                    controller.signal
                );
                setResult({ key, match });
            } catch {
                if (controller.signal.aborted) return;
                setResult({ key, match: null });
            }
        }, DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [canCheck, key, firstName, middleName, lastName, checkVisitor]);

    const isCurrent = canCheck && result?.key === key;

    return {
        match: isCurrent ? result.match : null,
        isChecking: canCheck && !isCurrent,
    };
};
