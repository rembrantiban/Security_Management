import {
    User,
    Mail,
    Lock,
    UserCog,
    UserPen,
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
import type { RegisterData, Users } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

type ViewEditUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: Users | null;
    onSuccess: () => void;
    onError: (message: string) => void;
};

export default function ViewEditUserDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
    onError,
}: ViewEditUserDialogProps) {
    const { updateUser, isLoading } = useAuth();


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

    useEffect(() => {
        if (user) {
            //eslint-disable-next-line
            setFormData({
                first_name: user.first_name || "",
                middle_name: user.middle_name || "",
                last_name: user.last_name || "",
                username: user.username || "",
                email: user.email || "",
                password: "",
                role: user.role || "",
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user) return;

        const result = await updateUser(user.user_id, formData);

        if (result.success) {
            onOpenChange(false);
            onSuccess();
            setFormData(initialFormData);
        } else {
            onError(result.message);
        }
    };
    return (
        <>
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="sm:max-w-2xl rounded">

                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <UserPen className="h-6 w-6 text-orange-500" />
                            </div>
                            Edit User
                        </DialogTitle>

                        <DialogDescription>
                            Update the details of an existing user in the Security Management System.
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
                                disabled={true}
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

                                    <SelectItem value="Administrator">
                                        Administrator
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
                            disabled={isLoading}
                            className="rounded bg-orange-700 hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "Updating..." : "Update User"}
                        </Button>

                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </>
    );
}