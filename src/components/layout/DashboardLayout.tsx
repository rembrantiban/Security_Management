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

        <div className="relative z-10">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
