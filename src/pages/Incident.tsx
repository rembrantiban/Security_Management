import { useState } from "react";
import PermissionHeader from "@/components/AdminPermission/PermissionHeader";
import PermissionStats from "@/components/AdminPermission/PermissionStats";
import PermissionToolbar from "@/components/AdminPermission/PermissionToolbar";
import PermissionTable from "@/components/AdminPermission/PermissionTable";
import ArchivedIncidentsModal from "@/components/AdminPermission/ArchivedIncidentsModal";

const Incident = () => {
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-2 p-4">

        {/* Header */}
        <PermissionHeader />

        {/* Statistics */}
        <PermissionStats />

        {/* Search & Actions */}
        <PermissionToolbar
          onViewArchived={() => setArchivedOpen(true)}
          search={search}
          onSearchChange={setSearch}
          severity={severity}
          onSeverityChange={setSeverity}
          status={status}
          onStatusChange={setStatus}
        />

        {/* Permission Table */}
        <PermissionTable
          search={search}
          severity={severity}
          status={status}
        />

      </div>

      <ArchivedIncidentsModal
        open={archivedOpen}
        onOpenChange={setArchivedOpen}
      />
    </div>
  );
};

export default Incident;