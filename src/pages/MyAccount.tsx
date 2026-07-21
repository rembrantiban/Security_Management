import { useEffect, useState } from "react";
import {
    User as UserIcon,
    Mail,
    Shield,
    Eye,
    EyeOff,
    Lock,
    Pencil,
    X,
    Save,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast"
type ProfileForm = {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
};

type PasswordForm = {
    current: string;
    next: string;
    confirm: string;
};

export default function MyAccount() {
    const { showToast } = useToast();
    const { user, changeAccountDetails, changePassword } = useAuth();



    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<ProfileForm>({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
    });



    const [password, setPassword] = useState<PasswordForm>({
        current: "",
        next: "",
        confirm: "",
    });

    const [draft, setDraft] = useState(profile);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDraft({
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                email: user.email,
            });
        }
    }, [user]);

    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);


    const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

    function handleEditToggle() {
        if (isEditing) {
            setDraft(profile);
        }
        setIsEditing((v) => !v);
    }

    const handleSaveProfile = async () => {
        setSavingProfile(true);

        const result = await changeAccountDetails({
            first_name: draft.first_name,
            middle_name: draft.middle_name,
            last_name: draft.last_name,
            email: draft.email,
        });

        if (result.success) {
            setProfile(draft);
            setIsEditing(false);

            showToast(
                "success",
                "Profile Updated",
                result.message
            );
        } else {
            showToast(
                "error",
                "Update Failed",
                result.message
            );
        }
        setSavingProfile(false);
    };


    const handleSavePassword = async () => {
        setSavingPassword(true);

        const result = await changePassword({
            current_password: password.current,
            new_password: password.next,
            confirm_password: password.confirm,
        });

        if (result.success) {
            setPassword({
                current: "",
                next: "",
                confirm: "",
            });

            showToast(
                "success",
                "Password Updated",
                result.message
            );
        } else {
            showToast(
                "error",
                "Update Failed",
                result.message
            );
        }

        setSavingPassword(false);
    };

    const passwordsMismatch =
        password.confirm.length > 0 && password.next !== password.confirm;
    const canSavePassword =
        password.current.length > 0 &&
        password.next.length >= 8 &&
        password.next === password.confirm;

    return (
        <div className="min-h-full bg-gray-50/60 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Page heading */}
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-800">My Account</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage your profile information and security settings.
                    </p>
                </div>
                {/* Profile header card */}
                <div className="rounded-2xl border border-gray-300 bg-white p-5 sm:p-6 mb-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="relative shrink-0 mx-auto sm:mx-0">
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-700 to-amber-500 flex items-center justify-center text-white text-2xl font-semibold shadow-sm shadow-orange-900/20">
                                {initials}
                            </div>

                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-lg font-semibold text-gray-800">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 border border-orange-200">
                                    <Shield size={12} />
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleEditToggle}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${isEditing
                                ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                : "bg-linear-to-r from-orange-700 to-amber-700 text-white shadow-sm shadow-orange-900/30 hover:brightness-105"
                                }`}
                        >
                            {isEditing ? (
                                <>
                                    <X size={15} />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Pencil size={14} />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Profile details card */}
                <div className="rounded-2xl border border-gray-300 bg-white p-5 sm:p-6 mb-5 shadow-sm">
                    <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">
                        Profile Information
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field
                            label="First Name"
                            icon={<UserIcon size={15} />}
                            value={isEditing ? draft.first_name : user?.first_name || ""}
                            editable={isEditing}
                            onChange={(v) => setDraft((d) => ({ ...d, first_name: v }))}
                        />
                        <Field
                            label="Middle Name"
                            icon={<UserIcon size={15} />}
                            value={isEditing ? draft.middle_name : user?.middle_name || ""}
                            editable={isEditing}
                            onChange={(v) => setDraft((d) => ({ ...d, middle_name: v }))}
                        />
                        <Field
                            label="Last Name"
                            icon={<UserIcon size={15} />}
                            value={isEditing ? draft.last_name : user?.last_name || ""}
                            editable={isEditing}
                            onChange={(v) => setDraft((d) => ({ ...d, last_name: v }))}
                        />

                        <Field
                            label="Email Address"
                            icon={<Mail size={15} />}
                            value={isEditing ? draft.email : user?.email || ""}
                            editable={isEditing}
                            type="email"
                            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                        />

                    </div>

                    {isEditing && (
                        <div className="mt-5 flex justify-end gap-2.5 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={handleEditToggle}
                                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-700 to-amber-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-900/30 transition hover:brightness-105 disabled:opacity-60"
                            >
                                {savingProfile ? (
                                    <>
                                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Change password card */}
                <div className="rounded-2xl border border-gray-300 bg-white p-5 sm:p-6 shadow-sm">
                    <p className="text-xs tracking-widest text-gray-500 uppercase mb-1">
                        Change Password
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                        Use at least 8 characters, with a mix of letters, numbers, and symbols.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <PasswordField
                                label="Current Password"
                                value={password.current}
                                visible={showPw.current}
                                onToggleVisible={() =>
                                    setShowPw((s) => ({ ...s, current: !s.current }))
                                }
                                onChange={(v) => setPassword((p) => ({ ...p, current: v }))}
                            />
                        </div>

                        <PasswordField
                            label="New Password"
                            value={password.next}
                            visible={showPw.next}
                            onToggleVisible={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                            onChange={(v) => setPassword((p) => ({ ...p, next: v }))}
                        />

                        <PasswordField
                            label="Confirm New Password"
                            value={password.confirm}
                            visible={showPw.confirm}
                            onToggleVisible={() =>
                                setShowPw((s) => ({ ...s, confirm: !s.confirm }))
                            }
                            onChange={(v) => setPassword((p) => ({ ...p, confirm: v }))}
                            error={passwordsMismatch ? "Passwords do not match." : undefined}
                        />
                    </div>



                    <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={handleSavePassword}
                            disabled={!canSavePassword || savingPassword}
                            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-700 to-amber-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-900/30 transition hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {savingPassword ? (
                                <>
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock size={14} />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    icon,
    value,
    editable,
    type = "text",
    onChange,
}: {
    label: string;
    icon: React.ReactNode;
    value: string;
    editable: boolean;
    type?: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
            <div
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${editable
                    ? "border-gray-300 bg-white focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
                    : "border-gray-200 bg-gray-50"
                    }`}
            >
                <span className={editable ? "text-orange-600" : "text-gray-400"}>{icon}</span>
                {editable ? (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-800 outline-none"
                    />
                ) : (
                    <span className="text-sm text-gray-700">{value}</span>
                )}
            </div>
        </div>
    );
}

function PasswordField({
    label,
    value,
    visible,
    onToggleVisible,
    onChange,
    error,
}: {
    label: string;
    value: string;
    visible: boolean;
    onToggleVisible: () => void;
    onChange: (v: string) => void;
    error?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
            <div
                className={`flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:ring-2 ${error
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                    : "border-gray-300 focus-within:border-orange-400 focus-within:ring-orange-100"
                    }`}
            >
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-800 outline-none"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={onToggleVisible}
                    className="text-gray-400 hover:text-orange-600 transition shrink-0"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );
}