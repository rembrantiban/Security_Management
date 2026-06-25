import PermissionHeader from "@/components/AdminPermission/PermissionHeader";
import PermissionStats from "@/components/AdminPermission/PermissionStats";
import PermissionToolbar from "@/components/AdminPermission/PermissionToolbar";
import PermissionTable from "@/components/AdminPermission/PermissionTable";

const Incident = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-2 p-2">

        {/* Header */}
        <PermissionHeader />

        {/* Statistics */}
        <PermissionStats />

        {/* Search & Actions */}
        <PermissionToolbar />

        {/* Permission Table */}
        <PermissionTable />

      </div>
    </div>
  );
};

export default Incident;