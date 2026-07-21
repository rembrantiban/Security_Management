import {
    Pencil,
    Trash2,
    Eye,
    Shield,
    User,
    UserCheck,
    EllipsisVertical,
    CircleCheck,
    Ban,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserSkeleton from "./UserTableSkeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import type { Users } from "@/store/useAuthStore"
import { useNavigate } from "react-router-dom";
import { useState } from "react"
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import UpdateUserStatusDialog from "./UpdateUserStatusDialog";
import SetDutyScheduleDialog from "./SetDutyScheduleDialog";
import { useToast } from "@/hooks/useToast"

type Props = {
    users: Users[]
};

export default function UserTable({ users }: Props) {

    const { isFetchingUsers, deleteUser, isLoading, updateUserStatus, setDutySchedule } = useAuth();
    const navigate = useNavigate()
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUserDelete, setSelectedUserDelete] = useState<Users | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedUserStatus, setSelectedUserStatus] = useState<Users | null>(null);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [selectedScheduleUser, setSelectedScheduleUser] = useState<Users | null>(null);
    const { showToast } = useToast();

    if (isFetchingUsers) {
        return <UserSkeleton />;
    }

    const handleSetSchedule = async (
        duty_start: string,
        duty_end: string
    ) => {
        if (!selectedScheduleUser) return;

        const success = await setDutySchedule(
            selectedScheduleUser.user_id,
            {
                duty_start,
                duty_end,
            }
        );

        if (success) {
            setScheduleOpen(false);
            setSelectedScheduleUser(null);
        }
    };

    const handleUpdateUserStatus = async () => {
        if (!selectedUserStatus) return;

        const success = await updateUserStatus(
            selectedUserStatus.user_id,
            !selectedUserStatus.status
        );

        if (success) {
            setStatusOpen(false);
            setSelectedUserStatus(null);
        }
    };


    return (
        <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 z-10">
                        <TableRow>
                            <TableHead className="w-70">
                                User
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>

                        {users.map((user, index) => (

                            <TableRow
                                key={user.user_id}
                                className={`
                                    transition-all
                                    duration-300
                                    hover:bg-blue-50
                                    hover:shadow-sm
                                    ${index % 2 === 0
                                        ? "bg-white"
                                        : "bg-slate-50/60"
                                    }
                `}
                            >

                                {/* Avatar */}

                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar onClick={() =>
                                                    navigate(`/users/view/${user.user_id}`)
                                                } className="h-12 w-12 border shadow">
                                            <AvatarFallback className="bg-linear-to-br from-orange-900 to-orange-600 text-white font-bold">
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {user.first_name} {user.last_name}
                                            </p>

                                            <p className="text-xs text-green-600">
                                                {user.username}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Username */}

                                {/* Email */}

                                <TableCell>
                                    <span className="text-slate-600">
                                        {user.email}
                                    </span>
                                </TableCell>




                                <TableCell>
                                    {user.status ? (
                                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            <CircleCheck /> Active
                                        </Badge>

                                    ) : (

                                        <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">
                                            <Ban /> Deactivate
                                        </Badge>

                                    )}

                                </TableCell>

                                {/* Status */}


                                {/* Role */}

                                <TableCell>
                                    {user.role === "Administrator" && (
                                        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                                            <Shield className="mr-1 h-3 w-3" />
                                            Administrator
                                        </Badge>

                                    )}

                                    {user.role === "Authorized Staff" && (
                                        <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100">
                                            <UserCheck className="mr-1 h-3 w-3" />
                                            Authorized Staff
                                        </Badge>

                                    )}

                                    {user.role === "Security Personnel" && (
                                        <Badge className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">
                                            <User className="mr-1 h-3 w-3" />
                                            Security Personnel
                                        </Badge>

                                    )}

                                </TableCell>


                                {/* Created */}

                                <TableCell>
                                    <span className="text-slate-500">
                                        {new Date(user.created_at).toLocaleString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="text-sm text-slate-500">
                                        {user.last_login
                                            ? new Date(user.last_login).toLocaleString("en-US", {
                                                month: "short",
                                                day: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })
                                            : "Never"}
                                    </span>
                                </TableCell>

                                {/* Actions */}

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-xl"
                                            >
                                                <EllipsisVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48 rounded-xl"
                                        >
                                           
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    navigate(`/users/view/${user.user_id}`)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setOpen(true);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => {
                                                    setSelectedUserDelete(user);
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className={`${user.status ? 'text-red-700' : 'text-green-700'}`}
                                                onClick={() => {
                                                    setSelectedUserStatus(user);
                                                    setStatusOpen(true);
                                                }}
                                            >
                                                {user.status ? (
                                                    <>
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <CircleCheck className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>

                        ))}

                    </TableBody>

                </Table>
                <EditUserDialog open={open} onOpenChange={setOpen} user={selectedUser} />
                <DeleteUserDialog
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    user={selectedUserDelete}
                    loading={isLoading}
                    onConfirm={async () => {
                        if (!selectedUserDelete) return;

                        const success = await deleteUser(selectedUserDelete.user_id);

                        if (success) {
                            setDeleteOpen(false);
                            setSelectedUserDelete(null);

                            showToast(
                                "success",
                                "User Deleted",
                                "The user account has been deleted successfully."
                            );
                        }
                    }}
                />

                <UpdateUserStatusDialog
                    open={statusOpen}
                    onOpenChange={setStatusOpen}
                    user={selectedUserStatus}
                    loading={isLoading}
                    onConfirm={handleUpdateUserStatus}
                />

                <SetDutyScheduleDialog
                    key={selectedScheduleUser?.user_id}
                    open={scheduleOpen}
                    onOpenChange={setScheduleOpen}
                    personnel={selectedScheduleUser}
                    onSave={handleSetSchedule}
                />
            </div>
        </div>
    );
}