import {
    Pencil,
    Trash2,
    Eye,
    Shield,
    User,
    UserCheck,
    EllipsisVertical,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";




export default function UserTable() {

    const { users, getAllUsers } = useAuth();

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    return (
        <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 z-10">
                        <TableRow>
                            <TableHead className="w-70">
                                User
                            </TableHead>
                            <TableHead>Username</TableHead>
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
                                        <Avatar className="h-12 w-12 border shadow">
                                            <AvatarFallback className="bg-linear-to-br from-orange-900 to-orange-600 text-white font-bold">
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {user.first_name} {user.last_name}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                ID #{user.user_id}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Username */}

                                <TableCell>
                                    <span className="font-medium">
                                        @{user.username}
                                    </span>
                                </TableCell>

                                {/* Email */}

                                <TableCell>
                                    <span className="text-slate-600">
                                        {user.email}
                                    </span>
                                </TableCell>

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

                                    {user.role === "Security Guard" && (
                                        <Badge className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">
                                            <User className="mr-1 h-3 w-3" />
                                            Security Guard
                                        </Badge>

                                    )}

                                </TableCell>
                                {/* Status */}

                                <TableCell>
                                    {user.status ? (
                                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            ● Active
                                        </Badge>

                                    ) : (

                                        <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">
                                            ● Disabled
                                        </Badge>

                                    )}

                                </TableCell>

                                {/* Created */}

                                <TableCell>
                                    <span className="text-slate-500">
                                        {user.created_at}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="text-sm text-slate-500">
                                        {user.last_login}
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
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>

                        ))}

                    </TableBody>

                </Table>
            </div>
        </div>
    );
}