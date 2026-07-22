import { useState } from "react";
import {
    User,
    Mail,
    Lock,
    UserCog,
    BadgeCheck,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import type { RegisterData } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StatusDialog from "./StatusDailog";
import { useToast } from "@/hooks/useToast"

type AddUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

    const initialFormData: RegisterData = {
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        role: "",
    };
    const [formData, setFormData] = useState<RegisterData>(initialFormData);

    const handleSubmit = async () => {
        setStatusOpen(true);
        setStatusType("loading");
        setStatusTitle("Creating User");
        setStatusMessage(
            "Please wait while we create the new account."
        );

        const success = await createUserByAdmin(formData);

        if (success) {
            setStatusType("success");
            setStatusTitle("User Created");
            setStatusMessage(
                "The new user account has been created successfully."
            );

            showToast(
                "success",
                "User Created",
                "The new user account has been created successfully."
            );

            setFormData({
                first_name: "",
                middle_name: "",
                last_name: "",
                username: "",
                email: "",
                password: "",
                role: "",
            });

            setTimeout(() => {
                setStatusOpen(false);
                onOpenChange(false);
            }, 1500);
        } else {
            showToast(
                "error",
                "Creation Failed",
                error ?? "Something went wrong."
            );
            setStatusType("error");
            setStatusTitle("Creation Failed");
            setStatusMessage(
                error ?? "Something went wrong."
            );
        }
    };

    const isValid =
        formData.first_name.trim().length >= 2 &&
        formData.last_name.trim().length >= 2 &&
        formData.username.trim().length >= 4 &&
        formData.email.trim().includes("@") &&
        formData.password.trim().length >= 8 &&
        formData.role.trim() !== "";

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-2xl rounded-2xl">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BadgeCheck className="h-6 w-6 text-orange-600" />
                        Create New User
                    </DialogTitle>

                    <DialogDescription>
                        Add a new user to the Security Management System.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">

                    {/* First Name */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            First Name
                        </label>

                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                                placeholder="Juan"
                                className="pl-10 rounded"
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        first_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Middle Name */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Middle Name
                        </label>

                        <Input
                            placeholder="Dela"
                            className="rounded"
                            value={formData.middle_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    middle_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Last Name */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Last Name
                        </label>

                        <Input
                            className="rounded"
                            placeholder="Cruz"
                            value={formData.last_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    last_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Username */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Username
                        </label>

                        <Input
                            className="rounded"
                            placeholder="juancruz"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Email */}

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                                type="email"
                                placeholder="example@email.com"
                                className="pl-10 rounded"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Password */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 rounded"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Role */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Role
                        </label>

                        <Select
                            value={formData.role}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    role: value as "Security Personnel" | "Authorized Staff" | "Administrator",
                                })
                            }
                        >
                            <SelectTrigger className="rounded w-full ">
                                <UserCog className="mr-2 h-4 w-4 text-gray-400" />

                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="Security Personnel">
                                    Security Personnel
                                </SelectItem>

                                <SelectItem value="Authorized Staff">
                                    Authorized Staff
                                </SelectItem>
                            </SelectContent>

                        </Select>
                    </div>

                </div>

                <DialogFooter>

                    <Button
                        className="rounded"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="rounded bg-orange-700 hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? "Creating..." : "Create User"}
                    </Button>

                </DialogFooter>

            </DialogContent>
            <StatusDialog
                open={statusOpen}
                type={statusType}
                title={statusTitle}
                message={statusMessage}
                onClose={() => setStatusOpen(false)}
            />
        </Dialog>
    );
}