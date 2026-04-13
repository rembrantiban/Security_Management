import { Search, Bell,  HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/dashboard/users") return "User Management";
    if (location.pathname === "/dashboard/logs") return "Security Logs";
    if (location.pathname === "/dashboard/incidents") return "Incidents";
    return "Security Management System";
  };

  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      
      {/* LEFT: DYNAMIC TITLE */}
      <h1 className="text-lg font-semibold text-gray-800">
        {getTitle()}
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        
        <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-500">
          <Search size={16} className="mr-2" />
          <span className="mr-3">Search</span>
          <span className="bg-white border px-1.5 rounded text-xs text-gray-400">
            ⌘K
          </span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100">
          <HelpCircle size={18} />
        </button>

        <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
          ST
        </div>
      </div>
    </header>
  );
}