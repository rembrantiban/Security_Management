import { Fragment, useMemo } from "react";
import { Pencil, Trash2, FolderLock, ClipboardList, Loader2 } from "lucide-react";

import type { Permission } from "@/store/usePermissionsStore";

type PermissionTableProps = {
    permissions: Permission[];
    isLoading: boolean;
    onEdit: (permission: Permission) => void;
    onDelete: (permission: Permission) => void;
};

const SHELL =
    "overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm";

/**
 * Permission catalogue — one clean table, grouped by module.
 * Each row is a permission definition with inline edit / delete.
 */
export default function PermissionTable({
    permissions,
    isLoading,
    onEdit,
    onDelete,
}: PermissionTableProps) {
    const groups = useMemo(() => {
        const byModule = new Map<string, Permission[]>();

        for (const p of permissions) {
            if (!byModule.has(p.module_name)) byModule.set(p.module_name, []);
            byModule.get(p.module_name)!.push(p);
        }

        return [...byModule.entries()]
            .map(([module, rows]) => ({
                module,
                rows: rows.sort((a, b) =>
                    a.permission_name.localeCompare(b.permission_name)
                ),
            }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [permissions]);

    if (isLoading && permissions.length === 0) {
        return (
            <div className={`${SHELL} flex items-center justify-center gap-2 py-16`}>
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                <p className="text-[12px] text-slate-500">
                    Loading permissions…
                </p>
            </div>
        );
    }

    if (permissions.length === 0) {
        return (
            <div className={`${SHELL} py-16 text-center`}>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <ClipboardList className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-[13px] font-medium text-slate-700">
                    No permissions found
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    Nothing matches the current search.
                </p>
            </div>
        );
    }

    return (
        <div className={SHELL}>
            <div className="max-h-[62vh] overflow-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="sticky top-0 z-10 bg-slate-50/95 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 backdrop-blur-sm">
                                Permission
                            </th>
                            <th className="sticky top-0 z-10 w-24 bg-slate-50/95 px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400 backdrop-blur-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {groups.map(({ module, rows }) => (
                            <Fragment key={module}>
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="border-b border-slate-100 bg-white/40 px-5 pt-4 pb-2"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <FolderLock className="h-3.5 w-3.5 text-amber-700" />
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                {module}
                                            </span>
                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-500">
                                                {rows.length}
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                                {rows.map((permission) => (
                                    <tr
                                        key={permission.permission_id}
                                        className="border-b border-slate-50 transition-colors hover:bg-amber-50/40"
                                    >
                                        <td className="px-5 py-2.5 pl-11">
                                            <span className="text-[12.5px] text-slate-700">
                                                {permission.permission_name}
                                            </span>
                                            <span className="ml-2 text-[10.5px] tabular-nums text-slate-300">
                                                #{permission.permission_id}
                                            </span>
                                        </td>

                                        <td className="px-5 py-2.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(permission)
                                                    }
                                                    aria-label={`Edit ${permission.permission_name}`}
                                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-amber-700 hover:ring-1 hover:ring-slate-200"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(permission)
                                                    }
                                                    aria-label={`Delete ${permission.permission_name}`}
                                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600 hover:ring-1 hover:ring-slate-200"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
