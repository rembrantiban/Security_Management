import {
    MoreVertical,
    Pencil,
    Trash2,
    ShieldCheck,
    Users,
    ClipboardList,
    Camera,
    FileBarChart2,
    Settings,
    UserRound,
    ShieldAlert,
} from "lucide-react";

import type { Permission } from "@/store/usePermissionsStore";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    TableCell,
    TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

type PermissionRowProps = {
    permission: Permission;

    onEdit: (permission: Permission) => void;

    onDelete: (permission: Permission) => void;
};

const moduleIcons: Record<
    string,
    {
        icon: typeof ShieldCheck;
        color: string;
    }
> = {
    Users: {
        icon: Users,
        color: "bg-blue-100 text-blue-700",
    },

    Incident: {
        icon: ShieldAlert,
        color: "bg-red-100 text-red-700",
    },

    Visitor: {
        icon: UserRound,
        color: "bg-emerald-100 text-emerald-700",
    },

    Monitoring: {
        icon: Camera,
        color: "bg-violet-100 text-violet-700",
    },

    Reports: {
        icon: FileBarChart2,
        color: "bg-amber-100 text-amber-700",
    },

    Audit: {
        icon: ClipboardList,
        color: "bg-cyan-100 text-cyan-700",
    },

    Settings: {
        icon: Settings,
        color: "bg-slate-100 text-slate-700",
    },
};

export default function PermissionRow({
    permission,
    onEdit,
    onDelete,
}: PermissionRowProps) {
    const config =
        moduleIcons[permission.module_name] ?? {
            icon: ShieldCheck,
            color: "bg-orange-100 text-orange-700",
        };

    const Icon = config.icon;

    return (
        <TableRow className="transition-colors hover:bg-orange-50/40">

            {/* Permission */}

            <TableCell>

                <div className="flex items-center gap-3">

                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.color}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div>

                        <p className="font-semibold text-slate-900">
                            {permission.permission_name}
                        </p>

                        <p className="text-xs text-slate-500">
                            Permission ID #
                            {permission.permission_id}
                        </p>

                    </div>

                </div>

            </TableCell>

            {/* Module */}

            <TableCell>

                <Badge
                    variant="outline"
                    className="rounded-full"
                >
                    {permission.module_name}
                </Badge>

            </TableCell>

            {/* Status */}

            <TableCell className="text-center">

                <Badge
                    className="
                    rounded-full
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-700
                    hover:bg-emerald-50
                "
                >
                    Active
                </Badge>

            </TableCell>

            {/* Actions */}

            <TableCell className="text-right">

                <DropdownMenu>

                    <DropdownMenuTrigger>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-44"
                    >

                        <DropdownMenuItem
                            onClick={() =>
                                onEdit(permission)
                            }
                            className="cursor-pointer"
                        >
                            <Pencil className="mr-2 h-4 w-4" />

                            Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() =>
                                onDelete(permission)
                            }
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />

                            Delete
                        </DropdownMenuItem>

                    </DropdownMenuContent>

                </DropdownMenu>

            </TableCell>

        </TableRow>
    );
}