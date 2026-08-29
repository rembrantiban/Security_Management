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
  Layers,
  HatGlasses,
  Key,
  ShieldAlert,
  History,
  UserX,
  DoorOpen,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutDialog from "../LogoutModal/LogoutModal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ItemType = {
  name: string;
  icon: React.ReactNode;
  path: string;
  children?: ItemType[];
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
  const { user, logout, hasModulePermission } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userData: User = {
    firstName: user?.first_name || "John",
    lastName: user?.last_name || "Doe",
    role: user?.role || "User",
  };

  const main: ItemType[] = [
    hasModulePermission("Dashboard Module", "View Administrator Dashboard") && {
      name: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      path: "/dashboard",
    },
  ].filter(Boolean) as ItemType[];

  const userManagement: ItemType[] = [
    hasModulePermission("User Role and Access Control Module", "View Users Accounts") && {
      name: "Users",
      icon: <Users size={16} />,
      path: "/users",
    },
  ].filter(Boolean) as ItemType[];

  const accessChildren: ItemType[] = [
    hasModulePermission("Visitor and Access Control Module", "Administrator View Register") && {
      name: "Access Register",
      icon: <DoorOpen size={15} />,
      path: "/access",
    },
    hasModulePermission("Visitor and Access Control Module", "Administrator View Register") && {
      name: "Visitor History",
      icon: <History size={15} />,
      path: "/visitor-history",
    },
    hasModulePermission("Visitor and Access Control Module", "Administrator View Register") && {
      name: "Blacklist History",
      icon: <UserX size={15} />,
      path: "/blacklist",
    },
  ].filter(Boolean) as ItemType[];

  const security: ItemType[] = [
    hasModulePermission("Incident Reporting and Management Module", "Admin View") && {
      name: "Incidents",
      icon: <AlertTriangle size={16} />,
      path: "/incidents",
    },

    hasModulePermission("Security Monitoring Module", "Assign Patrol Schedules") && {
      name: "Monitoring",
      icon: <FileText size={16} />,
      path: "/monitoring",
    },

    accessChildren.length > 0 && {
      name: "Access & Visitors",
      icon: <ShieldCheck size={16} />,
      path: "/access",
      children: accessChildren,
    },
  ].filter(Boolean) as ItemType[];

  const reports: ItemType[] = [
    { name: "Reports & Logs", icon: <ClipboardList size={16} />, path: "/reports" },
  ];

  const record: ItemType[] = [
    { name: "Record", icon: <ClipboardList size={16} />, path: "/record" },
  ];

  const system: ItemType[] = [
    { name: "Notifications", icon: <Bell size={16} />, path: "/notifications" },
  ];

  //Personnel Item Dashboard

  const personelDashboard: ItemType[] = [
    hasModulePermission("Dashbaord Module", "View Personnel Dashboard") && {
      name: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      path: "/personnel/dashboard",
    },
  ].filter(Boolean) as ItemType[];

  const personnelAccount: ItemType[] = [
    { name: "Account", icon: <Layers size={16} />, path: "/other-role-account" },
  ].filter(Boolean) as ItemType[];

  const personnelIncidents: ItemType[] = [
    hasModulePermission("Incident Reporting and Management Module", "Personnel View") && {
      name: "Incidents",
      icon: <AlertTriangle size={16} />,
      path: "/personnel/incidents",
    },
  ].filter(Boolean) as ItemType[];

  const personnelPatrols: ItemType[] = [
    { name: "Patrols", icon: <ShieldCheck size={16} />, path: "/personnel/patrols" },
  ].filter(Boolean) as ItemType[];

  const personnelVisitors: ItemType[] = [
    { name: "Visitors", icon: <HatGlasses size={16} />, path: "/personnel/visitors" },
  ].filter(Boolean) as ItemType[];

  const personnelReports: ItemType[] = [
    { name: "Reports", icon: <FileText size={16} />, path: "/personnel/reports" },
  ].filter(Boolean) as ItemType[];

  const personnelRecord: ItemType[] = [
    { name: " Security Record", icon: <ClipboardList size={16} />, path: "/personnel/record" },
  ].filter(Boolean) as ItemType[];

  const personnelNotifications: ItemType[] = [
    hasModulePermission("Notifications Module", "Personnel View Notification") && {
      name: "Notifications",
      icon: <Bell size={16} />,
      path: "/personnel/notifications",
    },
  ].filter(Boolean) as ItemType[];

  //IT SYSTEM ADMINISTRATOR

  const itSystemAdministrator: ItemType[] = [
    {
      name: "Permissions",
      icon: <ShieldCheck size={16} />,
      path: "/it-system-administrator/permissions",
    },
    { name: "Role Access", icon: <Key size={16} />, path: "/it-system-administrator/role-access" },
  ].filter(Boolean) as ItemType[];

  //AUTHORIZED STAFF

  const staffDashboard: ItemType[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/staff/dashboard" },
  ].filter(Boolean) as ItemType[];

  const staffIncidents: ItemType[] = [
    { name: "Incident Reports", icon: <ShieldAlert size={16} />, path: "/staff/incidents" },
  ].filter(Boolean) as ItemType[];

  const staffAccount: ItemType[] = [
    { name: "Account", icon: <Layers size={16} />, path: "/other-role-account" },
  ].filter(Boolean) as ItemType[];

  const staffNotifications: ItemType[] = [
    { name: "Notifications", icon: <Bell size={16} />, path: "/notifications" },
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
          `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all duration-200 ${
            isActive
              ? "bg-white/12 text-white font-medium ring-1 ring-white/15 shadow-sm shadow-black/10"
              : "text-amber-100/70 hover:bg-white/8 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-amber-200 transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={`shrink-0 transition-colors ${
                isActive ? "text-amber-200" : "text-amber-100/50 group-hover:text-amber-200"
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.name}</span>
          </>
        )}
      </NavLink>
    );
  }

  function NavCollapsible({ item }: { item: ItemType }) {
    const childPaths = item.children?.map((c) => c.path) ?? [];
    const hasActiveChild = childPaths.some(
      (p) => location.pathname === p || location.pathname.startsWith(p + "/")
    );
    const [expanded, setExpanded] = useState(hasActiveChild);

    useEffect(() => {
      if (hasActiveChild) setExpanded(true);
    }, [hasActiveChild]);

    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all duration-200 ${
            hasActiveChild
              ? "text-white font-medium"
              : "text-amber-100/70 hover:bg-white/8 hover:text-white"
          }`}
        >
          <span
            className={`shrink-0 transition-colors ${
              hasActiveChild ? "text-amber-200" : "text-amber-100/50 group-hover:text-amber-200"
            }`}
          >
            {item.icon}
          </span>
          <span className="flex-1 truncate text-left">{item.name}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-amber-100/50 transition-transform duration-200 group-hover:text-amber-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-200 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-5.5 mt-1 space-y-0.5 border-l border-white/10 pl-2.5">
              {item.children?.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] transition-all duration-150 ${
                      isActive
                        ? "bg-white/12 text-white font-medium ring-1 ring-white/15"
                        : "text-amber-100/60 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-amber-200"
                            : "text-amber-100/40 group-hover:text-amber-200"
                        }`}
                      >
                        {child.icon}
                      </span>
                      <span className="truncate">{child.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function NavGroup({ label, items }: { label: string; items: ItemType[] }) {
    if (items.length === 0) return null;

    return (
      <div>
        <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200/50">
          {label}
        </p>

        <div className="space-y-0.5">
          {items.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavCollapsible key={item.name} item={item} />
            ) : (
              <NavItem key={item.path} item={item} />
            )
          )}
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <aside className="flex h-full w-64 flex-col bg-amber-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-white/15">
            <img src="/sfc.png" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none tracking-tight text-white">SMS</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-amber-200/70">
              Security Management
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-amber-100/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav groups */}
      {user?.role === "Administrator" && (
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavGroup label="Main" items={main} />
          <NavGroup label="User Management" items={userManagement} />
          <NavGroup label="Security" items={security} />
          <NavGroup label="Reports & Logs" items={reports} />
          <NavGroup label="Others" items={record} />
          <NavGroup label="System" items={system} />
        </nav>
      )}

      {user?.role === "Security Personnel" && (
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavGroup label="Main" items={personelDashboard} />
          <NavGroup label="Account" items={personnelAccount} />
          <NavGroup label="Incidents & Surveillance" items={personnelIncidents} />
          <NavGroup label="Patrols" items={personnelPatrols} />
          <NavGroup label="Visitors" items={personnelVisitors} />
          <NavGroup label="Reports" items={personnelReports} />
          <NavGroup label="Record" items={personnelRecord} />
          <NavGroup label="Notifications" items={personnelNotifications} />
        </nav>
      )}

      {user?.role === "IT System Administrator" && (
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavGroup label="RBAC" items={itSystemAdministrator} />
        </nav>
      )}

      {user?.role === "Authorized Staff" && (
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavGroup label="Main" items={staffDashboard} />
          <NavGroup label="Incidents" items={staffIncidents} />
          <NavGroup label="Notifications" items={staffNotifications} />
          <NavGroup label="Account" items={staffAccount} />
        </nav>
      )}

      {/* Profile section */}
      <div className="border-t border-white/10 px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-white/8">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-medium leading-none text-white">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="mt-1 truncate text-[11px] text-amber-200/60">{userData.role}</p>
              </div>
              <ChevronDown
                size={14}
                className="shrink-0 text-amber-100/50 transition group-hover:text-amber-200"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            className="w-60 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-gray-200"
          >
            <div className="mb-1 flex items-center gap-2.5 px-2.5 py-2">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="truncate text-[11px] text-gray-400">{userData.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-gray-100" />
            {userData.role === "Administrator" && (
              <DropdownMenuItem
                onClick={() => navigate("/my-account")}
                className="cursor-pointer gap-2 rounded-lg text-[13px] text-gray-700 hover:bg-amber-50 hover:text-amber-800"
              >
                <UserCircle size={15} />
                My Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-[13px] text-red-500 focus:bg-red-50 focus:text-red-600"
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

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
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
      <div className="hidden h-screen lg:flex">
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
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-amber-950 font-semibold text-amber-100 ring-1 ring-white/20 ${sizes[size]}`}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}