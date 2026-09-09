import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Blurred image background */}
        <div
          className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat blur-xs"
          style={{ backgroundImage: "url('/campus.jpg')" }}
        />
        {/* Readability wash */}
        <div className="pointer-events-none absolute inset-0 bg-slate-100/40 dark:bg-slate-900/85" />

        {/* Topbar sits above page content via z-30. <main> is `relative` (so it
            paints above the blurred background layers) but has NO z-index, so it
            does NOT create a stacking context — modals rendered inside a page
            (fixed, z-50) can therefore rise above this topbar instead of being
            trapped beneath it. */}
        <div className="relative z-30 shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="relative flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
