
import UserHeader from "@/components/User/UserHeader";
import UserStats from "@/components/User/UserStats";
import UserToolbar from "@/components/User/UserToolbar";
import UserTable from "@/components/User/UserTable";
import UserPagination from "@/components/User/UserPagination";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-2 ">
        <UserHeader />

        <UserStats />

        <UserToolbar />

        <UserTable />

        <UserPagination />
      </div>
    </div>
  );
}