import { useEffect, useMemo, useState } from "react";
import {
    KeyRound,
    Lock,
    ShieldAlert,
    Timer,
    Loader2,
    RotateCcw,
    Save,
    Check,
} from "lucide-react";

import {
    useSecuritySettingsStore,
    SECURITY_SETTING_BOUNDS,
    type SecuritySettings as Settings,
} from "@/store/useSecuritySettingsStore";
import { useToast } from "@/hooks/useToast";

import ITAdminPageHeader from "@/components/ITSystemAdmin/ITAdminPageHeader";

/** Maintain Authentication and Account Security Settings — spec 2.30. */

const CARD =
    "rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/70";
const SECTION_LABEL =
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500";

type NumberField = {
    key: keyof Pick<
        Settings,
        | "minimum_password_length"
        | "maximum_login_attempts"
        | "lockout_minutes"
        | "session_timeout_minutes"
    >;
    label: string;
    hint: string;
    suffix: string;
};

type ToggleField = {
    key: keyof Pick<
        Settings,
        "require_uppercase" | "require_numbers" | "require_special_characters"
    >;
    label: string;
    hint: string;
};

const PASSWORD_TOGGLES: ToggleField[] = [
    {
        key: "require_uppercase",
        label: "Require an uppercase letter",
        hint: "At least one A–Z character.",
    },
    {
        key: "require_numbers",
        label: "Require a number",
        hint: "At least one 0–9 digit.",
    },
    {
        key: "require_special_characters",
        label: "Require a special character",
        hint: "At least one non-alphanumeric character.",
    },
];

function NumberRow({
    field,
    value,
    onChange,
}: {
    field: NumberField;
    value: number;
    onChange: (n: number) => void;
}) {
    const bounds = SECURITY_SETTING_BOUNDS[field.key];

    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-slate-800">
                    {field.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{field.hint}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <input
                    type="number"
                    min={bounds.min}
                    max={bounds.max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="h-9 w-20 rounded-xl border-0 bg-slate-50 px-3 text-right text-[12.5px] tabular-nums ring-1 ring-slate-200 outline-none transition focus:bg-white focus:ring-amber-300"
                />
                <span className="w-14 text-[11px] text-slate-400">
                    {field.suffix}
                </span>
            </div>
        </div>
    );
}

function ToggleRow({
    field,
    value,
    onChange,
}: {
    field: ToggleField;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-slate-800">
                    {field.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{field.hint}</p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={value}
                onClick={() => onChange(!value)}
                className={`relative h-6 w-11 shrink-0 rounded-full ring-1 transition-colors duration-200 ${
                    value
                        ? "bg-amber-700 ring-amber-700"
                        : "bg-slate-200 ring-slate-300"
                }`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        value ? "translate-x-0" : "-translate-x-5"
                    }`}
                />
            </button>
        </div>
    );
}

export default function SecuritySettings() {
    const { showToast } = useToast();
    const {
        settings,
        isLoading,
        isSaving,
        loaded,
        getSecuritySettings,
        updateSecuritySettings,
    } = useSecuritySettingsStore();

    const [draft, setDraft] = useState<Settings>(settings);

    useEffect(() => {
        getSecuritySettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (loaded) setDraft(settings);
    }, [loaded, settings]);

    const dirty = useMemo(
        () => JSON.stringify(draft) !== JSON.stringify(settings),
        [draft, settings]
    );

    const setField = <K extends keyof Settings>(key: K, value: Settings[K]) =>
        setDraft((prev) => ({ ...prev, [key]: value }));

    const clampNumbers = (s: Settings): Settings => {
        const clamp = (n: number, k: keyof typeof SECURITY_SETTING_BOUNDS) => {
            const b = SECURITY_SETTING_BOUNDS[k];
            if (Number.isNaN(n)) return b.min;
            return Math.min(b.max, Math.max(b.min, Math.trunc(n)));
        };
        return {
            ...s,
            minimum_password_length: clamp(
                s.minimum_password_length,
                "minimum_password_length"
            ),
            maximum_login_attempts: clamp(
                s.maximum_login_attempts,
                "maximum_login_attempts"
            ),
            lockout_minutes: clamp(s.lockout_minutes, "lockout_minutes"),
            session_timeout_minutes: clamp(
                s.session_timeout_minutes,
                "session_timeout_minutes"
            ),
        };
    };

    const handleSave = async () => {
        const payload = clampNumbers(draft);
        setDraft(payload);

        const ok = await updateSecuritySettings(payload);

        showToast(
            ok ? "success" : "error",
            ok ? "Settings saved" : "Save failed",
            ok
                ? "The new authentication policy is now in effect."
                : "Your changes were not saved. Please try again."
        );
    };

    const policySummary = useMemo(() => {
        const parts = [`${draft.minimum_password_length}+ characters`];
        if (draft.require_uppercase) parts.push("uppercase");
        if (draft.require_numbers) parts.push("number");
        if (draft.require_special_characters) parts.push("special character");
        return parts.join(" · ");
    }, [draft]);

    const passwordNumberField: NumberField = {
        key: "minimum_password_length",
        label: "Minimum password length",
        hint: `Between ${SECURITY_SETTING_BOUNDS.minimum_password_length.min} and ${SECURITY_SETTING_BOUNDS.minimum_password_length.max} characters.`,
        suffix: "chars",
    };

    const loginFields: NumberField[] = [
        {
            key: "maximum_login_attempts",
            label: "Maximum failed login attempts",
            hint: "Consecutive failures before the account is locked.",
            suffix: "attempts",
        },
        {
            key: "lockout_minutes",
            label: "Lockout duration",
            hint: "How long a locked account stays locked.",
            suffix: "minutes",
        },
    ];

    const sessionField: NumberField = {
        key: "session_timeout_minutes",
        label: "Session timeout",
        hint: "Idle-free lifetime of an authenticated session before re-login is required.",
        suffix: "minutes",
    };

    return (
        <div className="space-y-5">
            <ITAdminPageHeader
                reference="2.30"
                title="Authentication & Account Security Settings"
                description="System-wide password policy, login lockout thresholds, and session lifetime. Changes take effect on the next authentication attempt."
                icon={Lock}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => setDraft(settings)}
                            disabled={!dirty || isSaving}
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[12px] font-medium text-amber-50 ring-1 ring-white/15 transition hover:bg-white/20 disabled:opacity-40"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!dirty || isSaving}
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3.5 text-[12px] font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            {isSaving ? "Saving…" : "Save changes"}
                        </button>
                    </>
                }
            />

            {isLoading && !loaded ? (
                <div className={`${CARD} flex items-center justify-center gap-2 py-20`}>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <p className="text-[12px] text-slate-500">Loading settings…</p>
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {/* Password policy */}
                        <div className={`${CARD} p-5`}>
                            <div className="mb-1 flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-amber-700" />
                                <p className={SECTION_LABEL}>Password policy</p>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <NumberRow
                                    field={passwordNumberField}
                                    value={draft.minimum_password_length}
                                    onChange={(n) =>
                                        setField("minimum_password_length", n)
                                    }
                                />
                                {PASSWORD_TOGGLES.map((f) => (
                                    <ToggleRow
                                        key={f.key}
                                        field={f}
                                        value={draft[f.key]}
                                        onChange={(v) => setField(f.key, v)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Login protection */}
                        <div className={`${CARD} p-5`}>
                            <div className="mb-1 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-amber-700" />
                                <p className={SECTION_LABEL}>Login protection</p>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {loginFields.map((f) => (
                                    <NumberRow
                                        key={f.key}
                                        field={f}
                                        value={draft[f.key]}
                                        onChange={(n) => setField(f.key, n)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Session */}
                        <div className={`${CARD} p-5`}>
                            <div className="mb-1 flex items-center gap-2">
                                <Timer className="h-4 w-4 text-amber-700" />
                                <p className={SECTION_LABEL}>Session</p>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <NumberRow
                                    field={sessionField}
                                    value={draft.session_timeout_minutes}
                                    onChange={(n) =>
                                        setField("session_timeout_minutes", n)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live summary */}
                    <div className={`${CARD} h-fit p-5`}>
                        <p className={SECTION_LABEL}>Effective policy</p>

                        <dl className="mt-4 space-y-3.5">
                            <div>
                                <dt className="text-[11px] text-slate-400">
                                    Passwords must be
                                </dt>
                                <dd className="mt-1 text-[12.5px] font-medium text-slate-800">
                                    {policySummary}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] text-slate-400">
                                    Account lockout
                                </dt>
                                <dd className="mt-1 text-[12.5px] font-medium text-slate-800">
                                    {draft.maximum_login_attempts} failed attempts
                                    → locked for {draft.lockout_minutes} min
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] text-slate-400">
                                    Session lifetime
                                </dt>
                                <dd className="mt-1 text-[12.5px] font-medium text-slate-800">
                                    {draft.session_timeout_minutes} minutes
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500 ring-1 ring-slate-200">
                            {dirty ? (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Unsaved changes
                                </>
                            ) : (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    All changes saved
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
