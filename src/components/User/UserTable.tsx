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
    Clock,
    Check,
    X,
    KeyRound,
    UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import UserSkeleton from "./UserTableSkeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import type { Users } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import UpdateUserStatusDialog from "./UpdateUserStatusDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { useToast } from "@/hooks/useToast";
import AccountApproval from "./AccounAproval";

type Props = {
    users: Users[];
};

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const roleConfig: Record<string, { className: string; icon: typeof Shield }> = {
    Administrator: { className: "bg-violet-50 text-violet-700 ring-violet-100", icon: Shield },
    "Authorized Staff": { className: "bg-blue-50 text-blue-700 ring-blue-100", icon: UserCheck },
    "Security Personnel": { className: "bg-amber-50 text-amber-800 ring-amber-100", icon: User },
};

function formatDate(value: string) {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function UserTable({ users }: Props) {

    const { isFetchingUsers, deleteUser, isLoading, updateUserStatus } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUserDelete, setSelectedUserDelete] = useState<Users | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedUserStatus, setSelectedUserStatus] = useState<Users | null>(null);
    const { showToast } = useToast();
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [selectedApprovalUser, setSelectedApprovalUser] = useState<Users | null>(null);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [selectedUserResetPassword, setSelectedUserResetPassword] = useState<Users | null>(null);

    if (isFetchingUsers) {
        return <UserSkeleton />;
    }

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
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="border-slate-100 bg-slate-100/70 backdrop-blur hover:bg-slate-50/90">
                            <TableHead className={`${headCell} w-65 px-5`}>User</TableHead>
                            <TableHead className={headCell}>Email</TableHead>
                            <TableHead className={headCell}>Role</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={headCell}>Approval</TableHead>
                            <TableHead className={headCell}>Created</TableHead>
                            <TableHead className={headCell}>Last Login</TableHead>
                            <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>

                        {users.map((user) => {
                            const role = roleConfig[user.role];
                            const RoleIcon = role?.icon;

                            return (
                                <TableRow
                                    key={user.user_id}
                                    className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                >

                                    {/* User */}
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/users/view/${user.user_id}`)}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10 transition hover:bg-amber-900"
                                            >
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </button>

                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell className="py-3">
                                        <span className="text-[12.5px] text-slate-600">{user.email}</span>
                                    </TableCell>

                                    {/* Role */}
                                    <TableCell className="py-3">
                                        {role && (
                                            <span className={`${chip} ${role.className}`}>
                                                <RoleIcon className="h-3 w-3" />
                                                {user.role}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-3">
                                        {user.status ? (
                                            <span className={`${chip} bg-emerald-50 text-emerald-700 ring-emerald-100`}>
                                                <CircleCheck className="h-3 w-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                                                <Ban className="h-3 w-3" />
                                                Deactivated
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Approval */}
                                    <TableCell className="py-3">
                                        {user.approval_status === "Approved" ? (
                                            <span className={`${chip} bg-emerald-50 text-emerald-700 ring-emerald-100`}>
                                                <Check className="h-3 w-3" />
                                                Approved
                                            </span>
                                        ) : user.approval_status === "Rejected" ? (
                                            <span className={`${chip} bg-red-50 text-red-700 ring-red-100`}>
                                                <X className="h-3 w-3" />
                                                Rejected
                                            </span>
                                        ) : (
                                            <span className={`${chip} bg-yellow-50 text-yellow-700 ring-yellow-100`}>
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Created */}
                                    <TableCell className="py-3">
                                        <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-700">
                                            {formatDate(user.created_at)}
                                        </span>
                                    </TableCell>

                                    {/* Last Login */}
                                    <TableCell className="py-3">
                                        {user.last_login ? (
                                            <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-700">
                                                {formatDate(user.last_login)}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-slate-700">Never</span>
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="px-5 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                className="w-48 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-slate-200"
                                            >
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                    onClick={() => navigate(`/users/view/${user.user_id}`)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View profile
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Update user
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                    onClick={() => {
                                                        setSelectedUserResetPassword(user);
                                                        setResetPasswordOpen(true);
                                                    }}
                                                >
                                                    <KeyRound className="h-3.5 w-3.5" />
                                                    Reset password
                                                </DropdownMenuItem>

                                                {user.approval_status === "Pending" && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        onClick={() => {
                                                            setSelectedApprovalUser(user);
                                                            setApprovalOpen(true);
                                                        }}
                                                    >
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                        Account approval
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator className="bg-slate-100" />

                                                <DropdownMenuItem
                                                    className={`cursor-pointer gap-2 rounded-lg text-[12.5px] ${user.status ? "text-slate-700" : "text-emerald-700"
                                                        }`}
                                                    onClick={() => {
                                                        setSelectedUserStatus(user);
                                                        setStatusOpen(true);
                                                    }}
                                                >
                                                    {user.status ? (
                                                        <>
                                                            <Ban className="h-3.5 w-3.5" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CircleCheck className="h-3.5 w-3.5" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-red-600 focus:bg-red-50 focus:text-red-700"
                                                    onClick={() => {
                                                        setSelectedUserDelete(user);
                                                        setDeleteOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete user
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {users.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={8} className="py-14 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                        <UsersRound className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <p className="mt-3 text-[13px] font-medium text-slate-600">
                                        No users found
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Adjust your search or filters, or add a new user.
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}

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

                <AccountApproval
                    open={approvalOpen}
                    onOpenChange={setApprovalOpen}
                    user={selectedApprovalUser}
                />

                <ResetPasswordDialog
                    open={resetPasswordOpen}
                    onOpenChange={setResetPasswordOpen}
                    user={selectedUserResetPassword}
                />
            </div>
        </div>
    );
}