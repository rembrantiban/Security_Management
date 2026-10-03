import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-stone-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-stone-100 dark:bg-stone-900">
        {/* Topbar sits above page content via z-30. <main> is `relative` but has
            NO z-index, so it does NOT create a stacking context — modals
            rendered inside a page (fixed, z-50) can therefore rise above this
            topbar instead of being trapped beneath it. */}
        <div className="relative z-30 shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
