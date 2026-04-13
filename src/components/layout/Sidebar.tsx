import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  AlertTriangle,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

type ItemType = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type User = {
  firstName: string;
  lastName: string;
  role: string;
};

export default function Sidebar() {
 // const [active, setActive] = useState("Dashboard");

  // 🔥 SAMPLE USER DATA (later connect to auth)
  const user: User = {
    firstName: "Scott",
    lastName: "Talledo",
    role: "Administrator",
  };
const main: ItemType[] = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
];

const userManagement: ItemType[] = [
  { name: "Users", icon: <Users size={18} />, path: "/users" },
  { name: "Guards", icon: <Shield size={18} />, path: "/guards" },
];

const security: ItemType[] = [
  { name: "Logs", icon: <FileText size={18} />, path: "/logs" },
  { name: "Incidents", icon: <AlertTriangle size={18} />, path: "/incidents" },
];

const system: ItemType[] = [
  { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
];


  function Item({ item }: { item: ItemType }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-2 rounded-lg transition ${
          isActive
            ? "bg-orange-50 text-orange-600 font-medium"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      {/* ACTIVE BAR */}
      <span className="absolute left-0 top-0 h-full w-1 bg-orange-500 rounded-r opacity-0 group-[.active]:opacity-100"></span>

      {item.icon}
      <span className="text-sm">{item.name}</span>
    </NavLink>
  );
}
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            S
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">SECURA</p>
            <p className="text-xs text-gray-400">Security System</p>
          </div>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">MAIN</p>
          {main.map((item, i) => <Item key={i} item={item} />)}
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">USER MANAGEMENT</p>
          {userManagement.map((item, i) => <Item key={i} item={item} />)}
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">SECURITY</p>
          {security.map((item, i) => <Item key={i} item={item} />)}
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">SYSTEM</p>
          {system.map((item, i) => <Item key={i} item={item} />)}
        </div>

      </div>

      {/* 🔥 PROFILE SECTION (BOTTOM) */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition cursor-pointer">
          
          {/* AVATAR */}
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          {/* USER INFO */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400">
              {user.role}
            </p>
          </div>

          {/* DROPDOWN ICON */}
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </aside>
  );
}