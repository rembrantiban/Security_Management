import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Lock,
    UserCog,
    BadgeCheck,
    X,
    ChevronDown,
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
// at least 8 chars, one lowercase, one uppercase, one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^()_+=-]{8,}$/;

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
            formData.password.length > 0 && !PASSWORD_REGEX.test(formData.password)
                ? "8+ characters with uppercase, lowercase & a number"
                : "",
    };

    const isValid =
        NAME_REGEX.test(formData.first_name) &&
        NAME_REGEX.test(formData.last_name) &&
        USERNAME_REGEX.test(formData.username) &&
        EMAIL_REGEX.test(formData.email) &&
        PASSWORD_REGEX.test(formData.password) &&
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
                                type="password"
                                placeholder="••••••••"
                                className={`rounded-xl pl-10 ${errors.password ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        {errors.password ? (
                            <p className="text-xs text-red-500">{errors.password}</p>
                        ) : (
                            <p className="text-xs text-slate-400">
                                8+ characters, with uppercase, lowercase &amp; a number
                            </p>
                        )}
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