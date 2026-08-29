import { useState } from "react";

import {
    KeyRound,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    Copy,
    Check,
    X,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { Users } from "@/store/useAuthStore";

type ResetPasswordDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: Users | null;
};

const PASSWORD_LENGTH = 14;
const PASSWORD_CHARSET =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";

function generateSecurePassword() {
    const values = new Uint32Array(PASSWORD_LENGTH);
    crypto.getRandomValues(values);

    return Array.from(values, (value) =>
        PASSWORD_CHARSET[value % PASSWORD_CHARSET.length]
    ).join("");
}

function getPasswordStrength(password: string) {
    if (!password) {
        return { score: 0, label: "", color: "" };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-blue-500" };

    return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

export default function ResetPasswordDialog({
    open,
    onOpenChange,
    user,
}: ResetPasswordDialogProps) {
    const { resetUserPassword, isLoading } = useAuth();
    const { showToast } = useToast();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [touched, setTouched] = useState(false);

    const resetFields = () => {
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setCopied(false);
        setTouched(false);
    };

    const handleClose = () => {
        resetFields();
        onOpenChange(false);
    };

    if (!user) return null;

    const strength = getPasswordStrength(newPassword);
    const lengthValid = newPassword.length >= 8;
    const passwordsMatch =
        confirmPassword.length > 0 && newPassword === confirmPassword;
    const passwordsMismatch =
        confirmPassword.length > 0 && newPassword !== confirmPassword;
    const canSubmit = lengthValid && passwordsMatch && !isLoading;

    const handleGenerate = () => {
        const generated = generateSecurePassword();
        setNewPassword(generated);
        setConfirmPassword(generated);
        setShowNewPassword(true);
        setShowConfirmPassword(true);
        setCopied(false);
    };

    const handleCopy = async () => {
        if (!newPassword) return;

        try {
            await navigator.clipboard.writeText(newPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast(
                "error",
                "Copy Failed",
                "Could not copy the password to your clipboard."
            );
        }
    };

    const handleSubmit = async () => {
        setTouched(true);

        if (!canSubmit) return;

        const result = await resetUserPassword(user.user_id, {
            new_password: newPassword,
            confirm_password: confirmPassword,
        });

        if (result.success) {
            showToast(
                "success",
                "Password Reset",
                `${user.first_name} ${user.last_name}'s password has been reset successfully.`
            );
            handleClose();
        } else {
            showToast(
                "error",
                "Reset Failed",
                result.message || "Something went wrong."
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!isLoading) {
                    if (value) {
                        onOpenChange(value);
                    } else {
                        handleClose();
                    }
                }
            }}
        >
            <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
                {/* Header */}
                <div className="relative border-b border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 px-6 py-5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200">
                        <KeyRound className="h-7 w-7 text-white" />
                    </div>

                    <h2 className="mt-3 text-center text-lg font-bold text-slate-900">
                        Reset User Password
                    </h2>

                    <p className="mt-1 text-center text-xs leading-5 text-slate-500">
                        Set a new password for this account. The user will
                        need to sign in with it immediately.
                    </p>
                </div>

                <div className="space-y-4 px-6">
                    {/* User Context Card */}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-900 to-orange-600 text-xs font-bold text-white shadow">
                            {user.first_name[0]}
                            {user.last_name[0]}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Generate password */}
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Secure Password
                    </button>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                            New Password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                className="rounded-xl pl-10 pr-20"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <div className="absolute right-2 top-1.5 flex items-center gap-1">
                                {newPassword && (
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="rounded-lg"
                                        onClick={handleCopy}
                                        title="Copy password"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    className="rounded-lg"
                                    onClick={() =>
                                        setShowNewPassword((value) => !value)
                                    }
                                    title={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Strength meter */}
                        {newPassword && (
                            <div className="space-y-1.5 pt-1">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4].map((segment) => (
                                        <div
                                            key={segment}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                segment <= strength.score
                                                    ? strength.color
                                                    : "bg-slate-200"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <p
                                    className={`text-xs font-medium ${
                                        strength.score <= 1
                                            ? "text-red-600"
                                            : strength.score === 2
                                            ? "text-amber-600"
                                            : strength.score === 3
                                            ? "text-blue-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {strength.label} password
                                    {!lengthValid && " · minimum 8 characters"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5 pb-1">
                        <label className="text-xs font-medium text-slate-700">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter new password"
                                className={`rounded-xl pl-10 pr-11 ${
                                    touched && passwordsMismatch
                                        ? "border-red-400 focus-visible:ring-red-200"
                                        : ""
                                }`}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />

                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="absolute right-2 top-1.5 rounded-lg"
                                onClick={() =>
                                    setShowConfirmPassword((value) => !value)
                                }
                                title={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {touched && passwordsMismatch && (
                            <p className="text-xs font-medium text-red-600">
                                Passwords do not match.
                            </p>
                        )}

                        {passwordsMatch && (
                            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Passwords match
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="gap-2 border-t bg-slate-50 px-6 py-4">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        disabled={isLoading}
                        onClick={handleClose}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
