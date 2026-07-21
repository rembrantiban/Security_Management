import { useEffect, useMemo, useState } from "react";

import { usePermissionStore } from "@/store/usePermissionsStore";
import type { Permission } from "@/store/usePermissionsStore";

import PermissionToolbar from "@/components/Permissions/PermissionToolbar";
import PermissionTable from "@/components/Permissions/PermissionTable";
import PermissionPagination from "@/components/Permissions/PermissionPagination";
import EmptyPermissions from "@/components/Permissions/EmptyPermissions";

import AddPermissionModal from "@/components/Permissions/AddPermissionModal";
import UpdatePermissionModal from "@/components/Permissions/UpdatePermissionModal";
import DeletePermissionDialog from "@/components/Permissions/DeletePermissionDialog";

export default function Permissions() {
    const {
        permissions,
        getPermissions,
        isLoading,
    } = usePermissionStore();

    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] =
        useState("All");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [rowsPerPage, setRowsPerPage] =
        useState(10);

    const [addOpen, setAddOpen] =
        useState(false);

    const [updateOpen, setUpdateOpen] =
        useState(false);

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);

    useEffect(() => {
        getPermissions();
        //eslint-disable-next-line
    }, []);

    const modules = useMemo(() => {
        const unique = new Set(
            permissions.map((p) => p.module_name)
        );

        return ["All", ...Array.from(unique)];
    }, [permissions]);

    const filteredPermissions =
        permissions.filter((permission) => {
            const searchMatch =
                permission.permission_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                permission.module_name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const moduleMatch =
                moduleFilter === "All"
                    ? true
                    : permission.module_name ===
                    moduleFilter;

            return searchMatch && moduleMatch;
        });

    const totalPages = Math.ceil(
        filteredPermissions.length / rowsPerPage
    );

    const paginatedPermissions =
        filteredPermissions.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        );

    return (
        <section className="space-y-5">

            <PermissionToolbar
                search={search}
                setSearch={setSearch}
                moduleFilter={moduleFilter}
                setModuleFilter={setModuleFilter}
                modules={modules}
                totalPermissions={
                    permissions.length
                }
                onRefresh={getPermissions}
                onAdd={() =>
                    setAddOpen(true)
                }
            />

            {filteredPermissions.length === 0 ? (
                <EmptyPermissions
                    onCreate={() =>
                        setAddOpen(true)
                    }
                />
            ) : (
                <>
                    <PermissionTable
                        permissions={
                            paginatedPermissions
                        }
                        isLoading={
                            isLoading
                        }
                        onEdit={(permission) => {
                            setSelectedPermission(
                                permission
                            );
                            setUpdateOpen(
                                true
                            );
                        }}
                        onDelete={(
                            permission
                        ) => {
                            setSelectedPermission(
                                permission
                            );
                            setDeleteOpen(
                                true
                            );
                        }}
                    />

                    <PermissionPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalItems={filteredPermissions.length}
                        onPageChange={setCurrentPage}
                        onRowsPerPageChange={(rows: number) => {
                            setRowsPerPage(rows);
                            setCurrentPage(1);
                        }}
                    />
                </>
            )}

            <AddPermissionModal
                open={addOpen}
                onOpenChange={setAddOpen}
            />

            <UpdatePermissionModal
                open={updateOpen}
                onOpenChange={
                    setUpdateOpen
                }
                permission={
                    selectedPermission
                }
            />

            <DeletePermissionDialog
                open={deleteOpen}
                onOpenChange={
                    setDeleteOpen
                }
                permission={
                    selectedPermission
                }
            />

        </section>
    );
}