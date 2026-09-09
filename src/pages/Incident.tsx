import { useState } from "react";
import PermissionHeader from "@/components/AdminPermission/PermissionHeader";
import PermissionStats from "@/components/AdminPermission/PermissionStats";
import PermissionToolbar from "@/components/AdminPermission/PermissionToolbar";
import PermissionTable from "@/components/AdminPermission/PermissionTable";
import ArchivedIncidentsPanel from "@/components/AdminPermission/ArchivedIncidentsPanel";

const Incident = () => {
  const [view, setView] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  const showArchived = view === "archived";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-2 p-4">

        {/* Header */}
        <PermissionHeader />

        {/* Statistics */}
        <PermissionStats />

        {showArchived ? (
          <ArchivedIncidentsPanel onBack={() => setView("active")} />
        ) : (
          <>
            {/* Search & Actions */}
            <PermissionToolbar
              onViewArchived={() => setView("archived")}
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
          </>
        )}

      </div>
    </div>
  );
};

export default Incident;
