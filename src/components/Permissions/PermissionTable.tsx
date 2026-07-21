import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    ClipboardList,
    Loader2,
} from "lucide-react";

import type { Permission } from "@/store/usePermissionsStore";

import PermissionRow from "./PermissionsRow";

type PermissionTableProps = {
    permissions: Permission[];
    isLoading: boolean;

    onEdit: (permission: Permission) => void;

    onDelete: (permission: Permission) => void;
};

export default function PermissionTable({
    permissions,
    isLoading,
    onEdit,
    onDelete,
}: PermissionTableProps) {
    if (isLoading) {
        return (
            <div className="rounded border border-slate-200 bg-white py-20">
                <div className="flex flex-col items-center justify-center">

                    <Loader2 className="h-10 w-10 animate-spin text-orange-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading permissions...
                    </p>

                </div>
            </div>
        );
    }

    if (permissions.length === 0) {
        return (
            <div className="rounded border border-slate-200 bg-white py-20">

                <div className="flex flex-col items-center justify-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">

                        <ClipboardList className="h-8 w-8 text-orange-700" />

                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                        No Permissions Found
                    </h3>

                    <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
                        No permissions match your current search or filter.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">

            <Table>

                <TableHeader>

                    <TableRow className="bg-slate-50 hover:bg-slate-50">

                        <TableHead className="w-[320px]">
                            Permission
                        </TableHead>

                        <TableHead>
                            Module
                        </TableHead>

                        <TableHead className="w-20 text-center">
                            Status
                        </TableHead>

                        <TableHead className="w-20 text-right">
                            Actions
                        </TableHead>

                    </TableRow>

                </TableHeader>

                <TableBody>

                    {permissions.map((permission) => (
                        <PermissionRow
                            key={permission.permission_id}
                            permission={permission}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}

                </TableBody>

            </Table>

        </div>
    );
}