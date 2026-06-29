
import UserHeader from "@/components/User/UserHeader";
import UserStats from "@/components/User/UserStats";
import UserToolbar from "@/components/User/UserToolbar";
import UserTable from "@/components/User/UserTable";
import UserPagination from "@/components/User/UserPagination";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function UsersPage() {

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const { users, getAllUsers } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = users.filter((user) => {
    const matchesSearch =
        user.first_name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        user.last_name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        user.username
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        user.email
            .toLowerCase()
            .includes(search.toLowerCase());

    const matchesRole =
        role === "all" ||
        user.role === role;

    const matchesStatus =
        status === "all" ||
        (status === "active" && user.status) ||
        (status === "disabled" && !user.status);

    return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
    );
});

  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(
    filteredUsers.length / ITEMS_PER_PAGE
);

const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
);

  useEffect(() => {
    getAllUsers();
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-2 ">
        <UserHeader />

        <UserStats />

        <UserToolbar
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          onRefresh={getAllUsers}
        />

        <UserTable users={paginatedUsers} />

        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}