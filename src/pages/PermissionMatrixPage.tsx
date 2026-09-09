import { Fragment, useEffect, useMemo, useState } from "react";
import {
    LayoutGrid,
    Check,
    Minus,
    Plus,
    Search,
    RefreshCw,
    Loader2,
} from "lucide-react";

import {
    usePermissionStore,
    type Permission,
} from "@/store/usePermissionsStore";
import {
    useRolePermissionStore,
    type UserRole,
} from "@/store/useRolePermissionStore";

import ITAdminPageHeader from "@/components/ITSystemAdmin/ITAdminPageHeader";
import PermissionTable from "@/components/Permissions/PermissionTable";
import EmptyPermissions from "@/components/Permissions/EmptyPermissions";
import AddPermissionModal from "@/components/Permissions/AddPermissionModal";
import UpdatePermissionModal from "@/components/Permissions/UpdatePermissionModal";
import DeletePermissionDialog from "@/components/Permissions/DeletePermissionDialog";

/** Configure Permission Matrix — spec 2.29. */

const ROLES: UserRole[] = [
    "Administrator",
    "Security Personnel",
    "Authorized Staff",
];

const ROLE_SHORT: Partial<Record<UserRole, string>> = {
    Administrator: "Admin",
    "Security Personnel": "Security",
    "Authorized Staff": "Staff",
};

const CARD =
    "rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/70";

type Tab = "matrix" | "catalog";

export default function PermissionMatrixPage() {
    const { permissions, getPermissions, isLoading } = usePermissionStore();
    const { permissionMatrix, getPermissionMatrix } = useRolePermissionStore();

    const [tab, setTab] = useState<Tab>("matrix");
    const [search, setSearch] = useState("");

    // Catalog state
    const [addOpen, setAddOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Permission | null>(null);

    useEffect(() => {
        getPermissions();
        getPermissionMatrix();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const base = !query
            ? permissions
            : permissions.filter(
                  (p) =>
                      p.permission_name.toLowerCase().includes(query) ||
                      p.module_name.toLowerCase().includes(query)
              );

        return [...base].sort(
            (a, b) =>
                a.module_name.localeCompare(b.module_name) ||
                a.permission_name.localeCompare(b.permission_name)
        );
    }, [permissions, search]);

    const groupedForMatrix = useMemo(() => {
        return filtered.reduce((acc, permission) => {
            (acc[permission.module_name] ??= []).push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [filtered]);

    const roleHas = (role: UserRole, permissionId: number) =>
        (permissionMatrix[role] ?? []).includes(permissionId);

    const refresh = () => {
        getPermissions();
        getPermissionMatrix();
    };

    return (
        <div className="space-y-5">
            <ITAdminPageHeader
                reference="2.29"
                title="Permission Matrix"
                description="The full cross-role view of every permission in the system, plus the permission catalogue used to define what actions exist."
                icon={LayoutGrid}
                actions={
                    <>
                        <div className="inline-flex items-center gap-0.5 rounded-xl bg-white/10 p-0.5 ring-1 ring-white/15">
                            {(["matrix", "catalog"] as Tab[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTab(t)}
                                    className={`rounded-lg px-3 py-1.5 text-[11.5px] font-medium capitalize transition ${
                                        tab === t
                                            ? "bg-white text-amber-900 shadow-sm"
                                            : "text-amber-50/80 hover:text-white"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={refresh}
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[12px] font-medium text-amber-50 ring-1 ring-white/15 transition hover:bg-white/20"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh
                        </button>
                    </>
                }
            />

            {/* Toolbar */}
            <div className={`${CARD} flex flex-wrap items-center gap-3 p-4`}>
                <div className="relative min-w-55 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search permissions or modules"
                        className="h-9 w-full rounded-xl border-0 bg-slate-50 pl-9 pr-3 text-[12.5px] ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-amber-300"
                    />
                </div>

                <span className="text-[11px] tabular-nums text-slate-400">
                    {filtered.length} permission
                    {filtered.length === 1 ? "" : "s"}
                </span>

                {tab === "catalog" && (
                    <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-amber-800 px-3.5 text-[12px] font-medium text-white transition hover:bg-amber-900"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New permission
                    </button>
                )}
            </div>

            {/* Body */}
            {isLoading && permissions.length === 0 ? (
                <div className={`${CARD} flex items-center justify-center gap-2 py-16`}>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <p className="text-[12px] text-slate-500">Loading permissions…</p>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyPermissions onCreate={() => setAddOpen(true)} />
            ) : tab === "matrix" ? (
                <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                    <th className="sticky left-0 z-10 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                        Permission
                                    </th>
                                    {ROLES.map((role) => (
                                        <th
                                            key={role}
                                            className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400"
                                            title={role}
                                        >
                                            {ROLE_SHORT[role]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedForMatrix).map(
                                    ([module, mods]) => (
                                        <Fragment key={module}>
                                            <tr className="bg-slate-50/40">
                                                <td
                                                    colSpan={ROLES.length + 1}
                                                    className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                                                >
                                                    {module}
                                                </td>
                                            </tr>
                                            {mods.map((permission) => (
                                                <tr
                                                    key={permission.permission_id}
                                                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                                                >
                                                    <td className="sticky left-0 z-10 bg-white/50 px-5 py-2.5 text-[12.5px] text-slate-700 backdrop-blur-sm">
                                                        {
                                                            permission.permission_name
                                                        }
                                                    </td>
                                                    {ROLES.map((role) => {
                                                        const has = roleHas(
                                                            role,
                                                            permission.permission_id
                                                        );
                                                        return (
                                                            <td
                                                                key={role}
                                                                className="px-3 py-2.5 text-center"
                                                            >
                                                                {has ? (
                                                                    <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                                                                ) : (
                                                                    <Minus className="mx-auto h-3.5 w-3.5 text-slate-300" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </Fragment>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
                        Read-only. Assign or revoke permissions per role from{" "}
                        <span className="font-medium text-slate-500">
                            RBAC Policies (2.28)
                        </span>
                        .
                    </p>
                </div>
            ) : (
                <PermissionTable
                    permissions={filtered}
                    isLoading={isLoading}
                    onEdit={(p) => {
                        setSelected(p);
                        setUpdateOpen(true);
                    }}
                    onDelete={(p) => {
                        setSelected(p);
                        setDeleteOpen(true);
                    }}
                />
            )}

            <AddPermissionModal open={addOpen} onOpenChange={setAddOpen} />
            <UpdatePermissionModal
                open={updateOpen}
                onOpenChange={setUpdateOpen}
                permission={selected}
            />
            <DeletePermissionDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                permission={selected}
            />
        </div>
    );
}
