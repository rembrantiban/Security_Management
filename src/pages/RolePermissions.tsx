import { useEffect, useMemo, useState } from "react";

import { usePermissionStore } from "@/store/usePermissionsStore";
import { useRolePermissionStore } from "@/store/useRolePermissionStore";

import RolePermissionToolbar from "@/components/RolePermission/RolePermissionToolbar";
import PermissionMatrix from "@/components/RolePermission/PermissionMatrix";
import EmptyRolePermissions from "@/components/RolePermission/EmptyRolePermissions";
import SavePermissionDialog from "@/components/RolePermission/SavePermissionDialog";

const ROLES = [
    "Administrator",
    "Security Personnel",
    "Authorized Staff",
] as const;


export default function RolePermissions() {
    const { permissions, getPermissions } = usePermissionStore();

    const { assignPermission, removePermission, isLoading, getRolePermissions, updateRolePermissions } = useRolePermissionStore();

    const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[number]>("Administrator");

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [search, setSearch] = useState("");

    const [saveOpen, setSaveOpen] = useState(false);

    const handleTogglePermission = async (
        permissionId: number,
        checked: boolean
    ) => {
        if (checked) {
            const success = await assignPermission(
                selectedRole,
                permissionId
            );

            if (success) {
                setSelectedPermissions((prev) => [
                    ...prev,
                    permissionId,
                ]);
            }
        } else {
            const success = await removePermission(
                selectedRole,
                permissionId
            );

            if (success) {
                setSelectedPermissions((prev) =>
                    prev.filter(
                        (id) => id !== permissionId
                    )
                );
            }
        }
    };


    useEffect(() => {
        getPermissions();
        // eslint-disable-next-line
    }, []);

    type UserRole = (typeof ROLES)[number];

    const loadRolePermissions = async (
        role: UserRole
    ) => {
        const data =
            await getRolePermissions(role);

        if (data) {
            setSelectedPermissions(data.map(({ permission_id }) => permission_id));
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRolePermissions(selectedRole);
        // eslint-disable-next-line
    }, [selectedRole]);


    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            if (
                search &&
                !permission.permission_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) &&
                !permission.module_name
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ) {
                return acc;
            }

            if (!acc[permission.module_name]) {
                acc[permission.module_name] = [];
            }

            acc[permission.module_name].push(
                permission
            );

            return acc;
        }, {} as Record<string, typeof permissions>);
    }, [permissions, search]);


    const handleSave = async () => {
        const success =
            await updateRolePermissions(
                selectedRole,
                selectedPermissions
            );

        if (success) {
            setSaveOpen(false);
        }
    };

    return (
        <section className="space-y-3">

            <RolePermissionToolbar
                search={search}
                setSearch={setSearch}
                onRefresh={() =>
                    loadRolePermissions(selectedRole)
                }
                roles={[...ROLES]}
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
            />

           

            {permissions.length === 0 ? (
                <EmptyRolePermissions />
            ) : (
                <PermissionMatrix
                    groupedPermissions={groupedPermissions}
                    selectedPermissions={selectedPermissions}
                    isLoading={isLoading}
                    onTogglePermission={handleTogglePermission}
                />
            )}

            <SavePermissionDialog
                open={saveOpen}
                onOpenChange={setSaveOpen}
                role={selectedRole}
                totalPermissions={
                    selectedPermissions.length
                }
                loading={isLoading}
                onSave={handleSave}
            />

        </section>
    );
}