import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  Bell,
  ChevronDown,
  UserCircle,
  LogOut,
  ShieldCheck,
  X,
  ClipboardList,
  MapPinned,
  Layers,
  HatGlasses,
  ShieldAlert,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutDialog from "../LogoutModal/LogoutModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const userData: User = {
    firstName: user?.first_name || "John",
    lastName: user?.last_name || "Doe",
    role: user?.role || "User",
  };

  const main: ItemType[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={17} />, path: "/dashboard" },
  ];

  const userManagement: ItemType[] = [
    { name: "Users", icon: <Users size={17} />, path: "/users" },
  ];

  const security: ItemType[] = [
    { name: "Incidents", icon: <AlertTriangle size={17} />, path: "/incidents" },
    { name: "Monitoring", icon: <FileText size={17} />, path: "/logs" },
    { name: "Access & Visitors", icon: <ShieldCheck size={17} />, path: "/access" },
  ];

   const reports: ItemType[] = [
    { name: "Reports & Logs", icon: <ClipboardList size={17} />, path: "/reports" },
  ];

    const record: ItemType[] = [
    { name: "Record", icon: <ClipboardList size={17} />, path: "/record" },
  ];



  const system: ItemType[] = [
    { name: "Notifications", icon: <Bell size={17} />, path: "/settings" },
  ];  


  //Personnel Item Dashboard

  const personelDashboard: ItemType[] = [
     { name: "Dashboard", icon: <LayoutDashboard size={17} />, path: "/personnel/dashboard" }
  ]

   const personnelAccount: ItemType[] = [
     { name: "Account", icon: <Layers size={17} />, path: "/other-role-account" }
  ]

    const personnelIncidents: ItemType[] = [
     { name: "Incidents", icon: <AlertTriangle size={17} />, path: "/personnel/incidents" },
     { name: "Incidents Tasks", icon: <ShieldAlert  size={17} />, path: "/personnel/incidents-tasks" },
     { name: "Assign Areas", icon: <MapPinned  size={17} />, path: "/personnel/surveillance" }
    ];

    
    const personnelVisitors: ItemType[] = [
     { name: "Visitors", icon: <HatGlasses size={17} />, path: "/personnel/visitors" },
    ];

      const personnelRecord: ItemType[] = [
     { name: "Record", icon: <ClipboardList size={17} />, path: "/personnel/record" },
    ];


        const personnelNotifications: ItemType[] = [
     { name: "Notifications", icon: <Bell size={17} />, path: "/personnel/notifications" },
    ];




  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  function NavItem({ item }: { item: ItemType }) {
    return (
      <NavLink
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
            isActive
              ? "bg-linear-to-r from-orange-700 to-amber-700 text-white shadow-sm shadow-orange-900/30 font-medium"
              : "text-gray-500 hover:bg-orange-50 hover:text-orange-800"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`transition-colors ${isActive ? "text-orange-200" : "text-gray-400 group-hover:text-orange-600"}`}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    );
  }

  const SidebarContent = () => (
    <aside className="w-64 h-full bg-white flex flex-col border-r border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl  flex items-center justify-center shadow-xl border-2 ">
            <img src="/sfc.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">SMS</p>
            <p className="text-[11px] text-orange-600 mt-0.5">Security Management</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav groups */}
       { user?.role === "Administrator" && (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <NavGroup label="Main" items={main} />
        <NavGroup label="User Management" items={userManagement} />
        <NavGroup label="Security" items={security} />
        <NavGroup label="Reports & Logs" items={reports} />
        <NavGroup label="Others" items={record} />
        <NavGroup label="System" items={system} />
      </nav>
       )}


       { user?.role === "Security Personnel" && (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <NavGroup label="Main" items={personelDashboard} />
          <NavGroup label="Account" items={personnelAccount} />
          <NavGroup label="Incidents & Surveillance" items={personnelIncidents} />
          <NavGroup label="Permissions" items={personnelVisitors} />
          <NavGroup label="Record" items={personnelRecord} />
          <NavGroup label="Notifications" items={personnelNotifications} />
        </nav>
       )}

      {/* Profile section */}
      <div className="px-3 py-3 border-t border-gray-300">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-orange-50 group">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-none truncate">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{userData.role}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 group-hover:text-orange-600 transition shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-60 rounded-2xl shadow-xl border border-gray-100 p-1">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{userData.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-gray-100" />
            { userData.role === "Administrator" && (
              <DropdownMenuItem onClick={() => navigate("/my-account")} className="rounded-lg cursor-pointer gap-2 text-gray-700 hover:text-orange-700 hover:bg-orange-50">
              <UserCircle size={15} />
              My Profile
            </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer gap-2 text-red-500 focus:text-red-600 focus:bg-red-50"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={15} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
    </aside>
  );

  function NavGroup({ label, items }: { label: string; items: ItemType[] }) {
    return (
      <div>
        <p className="text-xs tracking-widest text-gray-500 px-3 mb-1.5 uppercase">
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map((item, i) => (
            <NavItem key={i} item={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop persistent sidebar */}
      <div className="hidden lg:flex h-screen">
        <SidebarContent />
      </div>
    </>
  );
}

function Avatar({
  firstName,
  lastName,
  size = "md",
}: {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-full bg-linear-to-br from-orange-700 to-amber-500 font-semibold text-white ${sizes[size]}`}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}