import {
    FolderLock,
    ShieldCheck,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { Permission } from "@/store/usePermissionsStore";

type PermissionMatrixProps = {
    groupedPermissions: Record<string, Permission[]>;
    selectedPermissions: number[];
    isLoading: boolean;

    onTogglePermission: (
        permissionId: number,
        checked: boolean
    ) => void;
};

export default function PermissionMatrix({
    groupedPermissions,
    selectedPermissions,
    isLoading,
    onTogglePermission,
}: PermissionMatrixProps) {
    const modules = Object.keys(groupedPermissions);

    return (
        <div className="space-y-6">
            {modules.map((module) => {
                const permissions =
                    groupedPermissions[module];

                const selectedCount =
                    permissions.filter((permission) =>
                        selectedPermissions.includes(
                            permission.permission_id
                        )
                    ).length;

                return (
                    <div
                        key={module}
                        className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
                    >
                        {/* Module Header */}
                        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                    <FolderLock className="h-5 w-5 text-orange-700" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {module}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Configure access for this module.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                                <ShieldCheck className="h-4 w-4" />

                                {selectedCount} / {permissions.length}
                            </div>
                        </div>

                        {/* Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-15">
                                        #
                                    </TableHead>

                                    <TableHead>
                                        Permission
                                    </TableHead>

                                    <TableHead className="text-center w-30">
                                        Access
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {permissions.map(
                                    (
                                        permission,
                                        index
                                    ) => (
                                        <TableRow
                                            key={
                                                permission.permission_id
                                            }
                                            className="hover:bg-orange-50/40"
                                        >
                                            <TableCell className="text-muted-foreground">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            permission.permission_name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        Module:{" "}
                                                        {
                                                            permission.module_name
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={selectedPermissions.includes(
                                                        permission.permission_id
                                                    )}
                                                    disabled={isLoading}
                                                    onCheckedChange={(checked) =>
                                                        onTogglePermission(
                                                            permission.permission_id,
                                                            checked === true
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                );
            })}
        </div>
    );
}