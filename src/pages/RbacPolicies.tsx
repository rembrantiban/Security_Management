import { Fragment, useEffect, useMemo, useState } from "react";
import {
    ShieldCheck,
    Search,
    RefreshCw,
    Loader2,
    Shield,
    UserCheck,
    FolderLock,
    type LucideIcon,
} from "lucide-react";

import { usePermissionStore } from "@/store/usePermissionsStore";
import {
    useRolePermissionStore,
    type UserRole,
} from "@/store/useRolePermissionStore";
import { useToast } from "@/hooks/useToast";

import ITAdminPageHeader from "@/components/ITSystemAdmin/ITAdminPageHeader";
import EmptyRolePermissions from "@/components/RolePermission/EmptyRolePermissions";

/** Configure Role-Based Access Control (RBAC) Policies — spec 2.28. */

const ROLE_META: { role: UserRole; icon: LucideIcon }[] = [
    { role: "Administrator", icon: ShieldCheck },
    { role: "Security Personnel", icon: Shield },
    { role: "Authorized Staff", icon: UserCheck },
];

const CARD =
    "rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/70";

function Toggle({
    checked,
    disabled,
    busy,
    onChange,
    label,
}: {
    checked: boolean;
    disabled?: boolean;
    busy?: boolean;
    onChange: (next: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative h-5 w-9 shrink-0 rounded-full ring-1 transition-colors duration-200 disabled:opacity-50 ${
                checked
                    ? "bg-amber-700 ring-amber-700"
                    : "bg-slate-200 ring-slate-300"
            }`}
        >
            <span
                className={`absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
            >
                {busy && (
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-slate-400" />
                )}
            </span>
        </button>
    );
}

export default function RbacPolicies() {
    const { showToast } = useToast();
    const { permissions, getPermissions } = usePermissionStore();
    const {
        isLoading,
        getRolePermissions,
        assignPermission,
        removePermission,
    } = useRolePermissionStore();

    const [selectedRole, setSelectedRole] =
        useState<UserRole>("Administrator");
    const [granted, setGranted] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState("");
    const [pendingId, setPendingId] = useState<number | null>(null);

    useEffect(() => {
        getPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadRolePermissions = async (role: UserRole) => {
        const data = await getRolePermissions(role);
        setGranted(new Set(data.map((p) => p.permission_id)));
    };

    useEffect(() => {
        loadRolePermissions(selectedRole);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRole]);

    const groups = useMemo(() => {
        const query = search.trim().toLowerCase();

        const byModule = new Map<
            string,
            { permission_id: number; permission_name: string }[]
        >();

        for (const p of permissions) {
            if (
                query &&
                !p.permission_name.toLowerCase().includes(query) &&
                !p.module_name.toLowerCase().includes(query)
            ) {
                continue;
            }
            if (!byModule.has(p.module_name)) byModule.set(p.module_name, []);
            byModule.get(p.module_name)!.push({
                permission_id: p.permission_id,
                permission_name: p.permission_name,
            });
        }

        return [...byModule.entries()]
            .map(([module, rows]) => ({
                module,
                rows: rows.sort((a, b) =>
                    a.permission_name.localeCompare(b.permission_name)
                ),
            }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [permissions, search]);

    const visibleCount = groups.reduce((n, g) => n + g.rows.length, 0);
    const grantedVisible = groups.reduce(
        (n, g) =>
            n + g.rows.filter((r) => granted.has(r.permission_id)).length,
        0
    );

    const toggle = async (permissionId: number, next: boolean) => {
        setPendingId(permissionId);

        const ok = next
            ? await assignPermission(selectedRole, permissionId)
            : await removePermission(selectedRole, permissionId);

        setPendingId(null);

        if (!ok) {
            showToast(
                "error",
                "Update failed",
                "The policy change was not saved."
            );
            return;
        }

        setGranted((prev) => {
            const nextSet = new Set(prev);
            if (next) nextSet.add(permissionId);
            else nextSet.delete(permissionId);
            return nextSet;
        });
    };

    const firstLoad = isLoading && permissions.length === 0;

    return (
        <div className="space-y-5">
            <ITAdminPageHeader
                reference="2.28"
                title="RBAC Policies"
                description="Grant or revoke individual permissions for each system role. Every change applies immediately to all accounts holding the selected role."
                icon={ShieldCheck}
                actions={
                    <button
                        type="button"
                        onClick={() => loadRolePermissions(selectedRole)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[12px] font-medium text-amber-50 ring-1 ring-white/15 transition hover:bg-white/20"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </button>
                }
            />

            {/* Role + search */}
            <div className={`${CARD} p-5`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Role
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {ROLE_META.map(({ role, icon: Icon }) => {
                        const active = selectedRole === role;
                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setSelectedRole(role)}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-amber-800 text-white shadow-sm"
                                        : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:ring-slate-300"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {role}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search permissions or modules"
                            className="h-9 w-full rounded-xl border-0 bg-slate-50 pl-9 pr-3 text-[12.5px] ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-amber-300"
                        />
                    </div>

                    <span className="text-[11px] tabular-nums text-slate-400">
                        {grantedVisible} of {visibleCount} granted to{" "}
                        <span className="font-medium text-slate-500">
                            {selectedRole}
                        </span>
                    </span>
                </div>
            </div>

            {/* Single permission table */}
            {firstLoad ? (
                <div
                    className={`${CARD} flex items-center justify-center gap-2 py-16`}
                >
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <p className="text-[12px] text-slate-500">
                        Loading permissions…
                    </p>
                </div>
            ) : permissions.length === 0 ? (
                <EmptyRolePermissions onRefresh={getPermissions} />
            ) : groups.length === 0 ? (
                <div className={`${CARD} py-16 text-center`}>
                    <p className="text-[13px] font-medium text-slate-700">
                        No permissions match your search
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                        Try a different permission or module name.
                    </p>
                </div>
            ) : (
                <div className={`${CARD} overflow-hidden`}>
                    <div className="max-h-[62vh] overflow-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
                                    <th className="sticky top-0 z-10 bg-slate-50/95 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                        Permission
                                    </th>
                                    <th className="sticky top-0 z-10 w-24 bg-slate-50/95 px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                        Access
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {groups.map(({ module, rows }) => {
                                    const grantedInModule = rows.filter((r) =>
                                        granted.has(r.permission_id)
                                    ).length;

                                    return (
                                        <Fragment key={module}>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="border-b border-slate-100 bg-white px-5 pt-4 pb-2"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <FolderLock className="h-3.5 w-3.5 text-amber-700" />
                                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                            {module}
                                                        </span>
                                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-500">
                                                            {grantedInModule}/
                                                            {rows.length}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {rows.map((row) => {
                                                const isOn = granted.has(
                                                    row.permission_id
                                                );
                                                return (
                                                    <tr
                                                        key={row.permission_id}
                                                        className="border-b border-slate-50 transition-colors hover:bg-amber-50/40"
                                                    >
                                                        <td className="px-5 py-2.5 pl-11 text-[12.5px] text-slate-700">
                                                            {row.permission_name}
                                                        </td>
                                                        <td className="px-5 py-2.5 text-center">
                                                            <div className="flex justify-center">
                                                                <Toggle
                                                                    checked={isOn}
                                                                    disabled={
                                                                        pendingId !==
                                                                        null
                                                                    }
                                                                    busy={
                                                                        pendingId ===
                                                                        row.permission_id
                                                                    }
                                                                    onChange={(
                                                                        next
                                                                    ) =>
                                                                        toggle(
                                                                            row.permission_id,
                                                                            next
                                                                        )
                                                                    }
                                                                    label={`${
                                                                        isOn
                                                                            ? "Revoke"
                                                                            : "Grant"
                                                                    } ${
                                                                        row.permission_name
                                                                    } for ${selectedRole}`}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
                        Toggling a permission saves it immediately for every{" "}
                        {selectedRole} account.
                    </p>
                </div>
            )}
        </div>
    );
}
