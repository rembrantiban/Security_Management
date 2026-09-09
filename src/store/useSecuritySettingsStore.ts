import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";

/**
 * Authentication & Account Security Settings (IT / System Administrator, spec 2.30).
 *
 * A single system-wide record governing the password policy, login lockout
 * thresholds, and session lifetime. Backed by `GET/PUT /api/security-settings`,
 * which is restricted to the IT / System Administrator role.
 */

export interface SecuritySettings {
    minimum_password_length: number;
    require_uppercase: boolean;
    require_numbers: boolean;
    require_special_characters: boolean;
    maximum_login_attempts: number;
    lockout_minutes: number;
    session_timeout_minutes: number;
}

export const SECURITY_SETTING_BOUNDS = {
    minimum_password_length: { min: 6, max: 64 },
    maximum_login_attempts: { min: 3, max: 10 },
    lockout_minutes: { min: 1, max: 1440 },
    session_timeout_minutes: { min: 5, max: 1440 },
} as const;

const DEFAULTS: SecuritySettings = {
    minimum_password_length: 8,
    require_uppercase: true,
    require_numbers: true,
    require_special_characters: true,
    maximum_login_attempts: 5,
    lockout_minutes: 30,
    session_timeout_minutes: 30,
};

interface SecuritySettingsStore {
    settings: SecuritySettings;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    loaded: boolean;

    getSecuritySettings: () => Promise<void>;
    updateSecuritySettings: (
        payload: SecuritySettings
    ) => Promise<boolean>;
}

export const useSecuritySettingsStore = create<SecuritySettingsStore>(
    (set) => ({
        settings: DEFAULTS,
        isLoading: false,
        isSaving: false,
        error: null,
        loaded: false,

        getSecuritySettings: async () => {
            try {
                set({ isLoading: true, error: null });

                const res = await AxiosInstance.get("/security-settings");

                set({
                    settings: { ...DEFAULTS, ...res.data.settings },
                    isLoading: false,
                    loaded: true,
                });
            } catch (error) {
                const err = error as AxiosError<{ message: string }>;

                set({
                    isLoading: false,
                    error:
                        err.response?.data.message ??
                        "Failed to load security settings.",
                });
            }
        },

        updateSecuritySettings: async (payload) => {
            try {
                set({ isSaving: true, error: null });

                const res = await AxiosInstance.put(
                    "/security-settings",
                    payload
                );

                set({
                    settings: { ...DEFAULTS, ...res.data.settings },
                    isSaving: false,
                });

                return true;
            } catch (error) {
                const err = error as AxiosError<{ message: string }>;

                set({
                    isSaving: false,
                    error:
                        err.response?.data.message ??
                        "Failed to update security settings.",
                });

                return false;
            }
        },
    })
);
