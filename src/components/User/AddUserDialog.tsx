import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Lock,
    UserCog,
    BadgeCheck,
    X,
    ChevronDown,
    Eye,
    EyeOff,
    CheckCircle2,
    Circle,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import type { RegisterData } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusDialog from "./StatusDailog";
import { useToast } from "@/hooks/useToast";
import { createPortal } from "react-dom";


type AddUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const NAME_REGEX = /^[A-Za-z\s.'-]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password policy, checked in order so the user sees the first unmet rule.
// Mirrors the server policy: a special character is any non-alphanumeric character.
const PASSWORD_RULES: ReadonlyArray<{ regex: RegExp; label: string; message: string }> = [
    { regex: /^.{8,}$/, label: "At least 8 characters", message: "Password must be at least 8 characters long." },
    { regex: /^\S*$/, label: "No spaces", message: "Password must not contain spaces." },
    { regex: /[a-z]/, label: "One lowercase letter (a-z)", message: "Password must contain at least one lowercase letter." },
    { regex: /[A-Z]/, label: "One uppercase letter (A-Z)", message: "Password must contain at least one uppercase letter." },
    { regex: /\d/, label: "One number (0-9)", message: "Password must contain at least one number." },
    { regex: /[^A-Za-z0-9\s]/, label: "One special character (e.g. ! @ # $ %)", message: "Password must contain at least one special character." },
];

const getPasswordError = (password: string): string | null =>
    PASSWORD_RULES.find(({ regex }) => !regex.test(password))?.message ?? null;

const initialFormData: RegisterData = {
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
};

export default function AddUserDialog({
    open,
    onOpenChange,
}: AddUserDialogProps) {
    const { createUserByAdmin, isLoading, error } = useAuth();
    const { showToast } = useToast();
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusType, setStatusType] = useState<"loading" | "success" | "error">("loading");
    const [statusTitle, setStatusTitle] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [formData, setFormData] = useState<RegisterData>(initialFormData);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    const errors = {
        first_name:
            formData.first_name.length > 0 && !NAME_REGEX.test(formData.first_name)
                ? "Letters only, at least 2 characters"
                : "",
        last_name:
            formData.last_name.length > 0 && !NAME_REGEX.test(formData.last_name)
                ? "Letters only, at least 2 characters"
                : "",
        username:
            formData.username.length > 0 && !USERNAME_REGEX.test(formData.username)
                ? "4-20 characters, letters/numbers/underscore only"
                : "",
        email:
            formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)
                ? "Enter a valid email address"
                : "",
        password:
            formData.password.length > 0
                ? getPasswordError(formData.password) ?? ""
                : "",
    };

    const isValid =
        NAME_REGEX.test(formData.first_name) &&
        NAME_REGEX.test(formData.last_name) &&
        USERNAME_REGEX.test(formData.username) &&
        EMAIL_REGEX.test(formData.email) &&
        getPasswordError(formData.password) === null &&
        formData.role.trim() !== "";

    const handleSubmit = async () => {
        if (!isValid) return;

        setStatusOpen(true);
        setStatusType("loading");
        setStatusTitle("Creating User");
        setStatusMessage("Please wait while we create the new account.");

        const success = await createUserByAdmin(formData);

        if (success) {
            setStatusType("success");
            setStatusTitle("User Created");
            setStatusMessage("The new user account has been created successfully.");

            showToast("success", "User Created", "The new user account has been created successfully.");

            setFormData(initialFormData);
            setShowPassword(false);

            setTimeout(() => {
                setStatusOpen(false);
                onOpenChange(false);
            }, 1500);
        } else {
            showToast("error", "Creation Failed", error ?? "Something went wrong.");
            setStatusType("error");
            setStatusTitle("Creation Failed");
            setStatusMessage(error ?? "Something went wrong.");
        }
    };

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                            <BadgeCheck size={18} />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Create New User</h2>
                            <p className="text-xs text-slate-400">
                                Add a new user to the Security Management System
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">

                    {/* First Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">First Name</label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Juan"
                                className={`rounded-xl pl-10 ${errors.first_name ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>
                        {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">
                            Middle Name <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <Input
                            placeholder="Dela"
                            className="rounded-xl"
                            value={formData.middle_name}
                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Last Name</label>
                        <Input
                            placeholder="Cruz"
                            className={`rounded-xl ${errors.last_name ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                        {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Username</label>
                        <Input
                            placeholder="juancruz"
                            className={`rounded-xl ${errors.username ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Email Address</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="example@email.com"
                                className={`rounded-xl pl-10 ${errors.email ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Password</label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                aria-describedby="password-requirements"
                                aria-invalid={Boolean(errors.password)}
                                className={`rounded-xl pl-10 pr-10 ${errors.password ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-xs text-red-500" role="alert">{errors.password}</p>
                        )}

                        <div
                            id="password-requirements"
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                        >
                            <p className="mb-1.5 text-xs font-medium text-slate-600">
                                Password must contain:
                            </p>
                            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                {PASSWORD_RULES.map(({ regex, label }) => {
                                    const met = formData.password.length > 0 && regex.test(formData.password);
                                    return (
                                        <li
                                            key={label}
                                            className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-slate-500"}`}
                                        >
                                            {met ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            )}
                                            <span>{label}</span>
                                            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Role</label>
                        <div className="relative">
                            <UserCog className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value as "Security Personnel" | "Authorized Staff" | "Administrator",
                                    })
                                }
                                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            >
                                <option value="" disabled>Select role</option>
                                <option value="Security Personnel">Security Personnel</option>
                                <option value="Authorized Staff">Authorized Staff</option>
                                <option value="Administrator">Administrator</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="rounded-xl bg-orange-700 hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? "Creating..." : "Create User"}
                    </Button>
                </div>

            </div>

            <StatusDialog
                open={statusOpen}
                type={statusType}
                title={statusTitle}
                message={statusMessage}
                onClose={() => setStatusOpen(false)}
            />
        </div>,
         document.body
    );
}