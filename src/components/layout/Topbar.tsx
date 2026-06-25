import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const getTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/dashboard/users") return "User Management";
    if (location.pathname === "/dashboard/logs") return "Security Logs";
    if (location.pathname === "/dashboard/incidents") return "Incidents";
    if (location.pathname === "/dashboard/access") return "Access & Visitors";
    if (location.pathname === "/dashboard/settings") return "Settings";
    return "Security Management System";
  };

  const getSubtitle = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const firstName = user?.first_name || "S";
  const lastName = user?.last_name || "T";

  return (
    <header className="w-full h-15 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-4 py-3 gap-4 shadow-sm">

      {/* LEFT: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 p-2 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-orange-700 transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-800 leading-tight truncate">
            {getTitle()}
          </h1>
          <p className="hidden sm:block text-xs text-gray-400 mt-0.5">{getSubtitle()}</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* Search — hidden on mobile */}
        <button className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 px-3 py-2 rounded-xl text-sm text-gray-400 transition group">
          <Search size={14} className="group-hover:text-orange-600 transition" />
          <span className="text-gray-400 group-hover:text-orange-600 transition">Search</span>
          <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded-md text-[10px] text-gray-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-orange-700 transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help */}
        <button className="p-2 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-orange-700 transition">
          <HelpCircle size={18} />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-700 to-amber-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm shadow-orange-900/20 cursor-pointer hover:scale-105 transition-transform">
          {firstName[0]}{lastName[0]}
        </div>
      </div>
    </header>
  );
}