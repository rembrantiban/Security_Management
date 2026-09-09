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
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
                if (isLoading) return;
                if (value) onOpenChange(value);
                else handleClose();
            }}
        >
            <DialogContent className="sm:max-w-md gap-0 rounded-2xl p-0 overflow-hidden">

                {/* Header */}
                <DialogHeader className="gap-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                            <KeyRound className="h-[18px] w-[18px]" />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-[15px] font-semibold text-slate-900">
                                Reset User Password
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-[12px] leading-relaxed">
                                Set a new password for this account. The user signs in
                                with it immediately.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-3 px-5 py-4">

                    {/* User */}
                    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50">
                            {user.first_name[0]}
                            {user.last_name[0]}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium text-slate-900">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Generate */}
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2 text-[11.5px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate secure password
                    </button>

                    {/* New password */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-slate-700">
                            New password
                        </label>

                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                className="h-9 rounded-xl pl-9 pr-16 text-[12.5px]"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                                {newPassword && (
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="h-6 w-6 rounded-lg"
                                        onClick={handleCopy}
                                        title="Copy password"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    className="h-6 w-6 rounded-lg"
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
                                        <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {newPassword.length > 0 && !lengthValid && (
                            <p className="text-[11px] text-slate-400">
                                Use at least 8 characters.
                            </p>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-slate-700">
                            Confirm password
                        </label>

                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter new password"
                                className={`h-9 rounded-xl pl-9 pr-10 text-[12.5px] ${
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
                                className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-lg"
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
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>

                        {touched && passwordsMismatch && (
                            <p className="text-[11px] font-medium text-red-600">
                                Passwords do not match.
                            </p>
                        )}

                        {passwordsMatch && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Passwords match
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:justify-end">
                    <Button
                        variant="outline"
                        className="h-9 gap-1.5 rounded-xl text-[12.5px]"
                        disabled={isLoading}
                        onClick={handleClose}
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="h-9 gap-1.5 rounded-xl bg-indigo-600 text-[12.5px] hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Resetting…
                            </>
                        ) : (
                            <>
                                <KeyRound className="h-3.5 w-3.5" />
                                Reset Password
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
