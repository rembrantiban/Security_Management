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
  ShieldAlert,
  History,
  UserX,
  DoorOpen,
  LayoutGrid,
  Lock,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/useNotificationStore";
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
import {
  BACKGROUND_VIDEO_POSTER,
  BACKGROUND_VIDEO_SRC,
  useBackgroundVideo,
} from "@/hooks/useBackgroundVideo";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type ItemType = {
  name: string;
  icon: React.ReactNode;
  path: string;
  children?: ItemType[];
  badge?: number;
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

  // Only one sidebar copy is ever on screen: the persistent one on desktop,
  // or the drawer on smaller screens while it is open.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const getMyNotifications = useNotificationStore((s) => s.getMyNotifications);

  // Keep the sidebar notification badge in sync for the roles that receive
  // notifications. The store is shared with the topbar bell, so reads there
  // (mark-as-read / acknowledge) update this badge immediately too.
  useEffect(() => {
    if (
      user?.role !== "Security Personnel" &&
      user?.role !== "Authorized Staff"
    ) {
      return;
    }
    getMyNotifications();
    const timer = setInterval(getMyNotifications, 30_000);
    return () => clearInterval(timer);
  }, [user?.role, getMyNotifications]);

  const userData: User = {
    firstName: user?.first_name || "John",
    lastName: user?.last_name || "Doe",
    role: user?.role || "User",
  };

    //Administrator Item Dashboard


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
      name: "Blacklist Visitors",
      icon: <UserX size={15} />,
      path: "/blacklist",
    },
  ].filter(Boolean) as ItemType[];

  const security: ItemType[] = [
    hasModulePermission("Incident Reporting and Management Module", "Admin View Reports") && {
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
    hasModulePermission("Reports Module", "Admin View Reports") && {
      name: "Reports & Logs",
      icon: <ClipboardList size={16} />,
      path: "/reports",
    },
  ].filter(Boolean) as ItemType[];

  const record: ItemType[] = [
    hasModulePermission("Security Records Management Module", "Admin View Record") && {
      name: "Record",
      icon: <ClipboardList size={16} />,
      path: "/record",
      children: accessChildren,
    },
  ].filter(Boolean) as ItemType[];

  const system: ItemType[] = [
    hasModulePermission("Notifications Module", "Admin View Notification") && {
      name: "Notifications",
      icon: <Bell size={16} />,
      path: "/notifications",
      badge: unreadCount,
    },
  ].filter(Boolean) as ItemType[];


  const personelDashboard: ItemType[] = [
    hasModulePermission("Dashboard Module", "View Personnel Dashboard") && {
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
    { name: "Records", icon: <FileText size={16} />, path: "/personnel/reports" },
  ].filter(Boolean) as ItemType[];



  const personnelNotifications: ItemType[] = [
    hasModulePermission("Notifications Module", "Personnel View Notification") && {
      name: "Notifications",
      icon: <Bell size={16} />,
      path: "/personnel/notifications",
      badge: unreadCount,
    },
  ].filter(Boolean) as ItemType[];

  //IT SYSTEM ADMINISTRATOR

  // Access Control — RBAC policy configuration (spec 2.28 / 2.29)
  const itAccessControl: ItemType[] = [
    {
      name: "RBAC Policies",
      icon: <ShieldCheck size={16} />,
      path: "/it-system-administrator/rbac-policies",
    },
    {
      name: "Permission Matrix",
      icon: <LayoutGrid size={16} />,
      path: "/it-system-administrator/permission-matrix",
    },
  ];

  // Authentication — account security settings (spec 2.30)
  const itAuthentication: ItemType[] = [
    {
      name: "Security Settings",
      icon: <Lock size={16} />,
      path: "/it-system-administrator/security-settings",
    },
  ];

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
    {
      name: "Notifications",
      icon: <Bell size={16} />,
      path: "/notifications",
      badge: unreadCount,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  function NavItem({ item }: { item: ItemType }) {
    return (
      <NavLink
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
            isActive
              ? "bg-white/10 font-medium text-white"
              : "text-stone-400 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-orange-400 transition-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={`shrink-0 transition-colors ${
                isActive ? "text-orange-300" : "text-stone-500 group-hover:text-stone-300"
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.name}</span>
            {typeof item.badge === "number" && item.badge > 0 && (
              <span className="ml-auto flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
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
          className={`group flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
            hasActiveChild
              ? "font-medium text-white"
              : "text-stone-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span
            className={`shrink-0 transition-colors ${
              hasActiveChild ? "text-orange-300" : "text-stone-500 group-hover:text-stone-300"
            }`}
          >
            {item.icon}
          </span>
          <span className="flex-1 truncate text-left">{item.name}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-stone-500 transition-transform duration-200 group-hover:text-stone-300 ${
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
            <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
              {item.children?.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                      isActive
                        ? "bg-white/10 font-medium text-white"
                        : "text-stone-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-orange-300"
                            : "text-stone-500 group-hover:text-stone-300"
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
        <p className="mb-1.5 px-3 text-[10.5px] font-medium uppercase tracking-[0.16em] text-stone-500">
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
    <aside className="relative flex h-full w-64 flex-col border-r border-white/5 bg-amber-950/7 0">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-2.5">
          <img src="/sfc.png" alt="" className="h-8 w-8 object-contain bg-white rounded-2xl" />
          <div>
            <p className="text-[14px] font-semibold leading-none tracking-tight text-white">
              SFC Security
            </p>
            <p className="mt-1 text-[11px] text-stone-500">Campus Security Office</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav groups */}
      {user?.role === "Administrator" && (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <NavGroup label="Main" items={main} />
          <NavGroup label="User Management" items={userManagement} />
          <NavGroup label="Security" items={security} />
          <NavGroup label="Reports & Logs" items={reports} />
          <NavGroup label="Others" items={record} />
          <NavGroup label="System" items={system} />
        </nav>
      )}

      {user?.role === "Security Personnel" && (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <NavGroup label="Main" items={personelDashboard} />
          <NavGroup label="Account" items={personnelAccount} />
          <NavGroup label="Incidents & Surveillance" items={personnelIncidents} />
          <NavGroup label="Security" items={personnelPatrols} />
          <NavGroup label="Visitors" items={personnelVisitors} />
          <NavGroup label="Reports" items={personnelReports} />
          <NavGroup label="Notifications" items={personnelNotifications} />
        </nav>
      )}

      {user?.role === "IT System Administrator" && (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <NavGroup label="Access Control" items={itAccessControl} />
          <NavGroup label="Authentication" items={itAuthentication} />
        </nav>
      )}

      {user?.role === "Authorized Staff" && (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <NavGroup label="Main" items={staffDashboard} />
          <NavGroup label="Incidents" items={staffIncidents} />
          <NavGroup label="Notifications" items={staffNotifications} />
          <NavGroup label="Account" items={staffAccount} />
        </nav>
      )}

      {/* Profile section */}
      <div className="border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="group flex w-full items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-white/5">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-medium leading-none text-white">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="mt-1 truncate text-[11px] text-stone-500">{userData.role}</p>
              </div>
              <ChevronDown
                size={14}
                className="shrink-0 text-stone-500 transition-colors group-hover:text-stone-300"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            className="w-60 rounded-md border border-stone-200 p-1 shadow-lg"
          >
            <div className="mb-1 flex items-center gap-2.5 px-2.5 py-2">
              <Avatar firstName={userData.firstName} lastName={userData.lastName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-stone-900">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="truncate text-[11px] text-stone-500">{userData.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-stone-100" />
            {userData.role === "Administrator" && (
              <DropdownMenuItem
                onClick={() => navigate("/my-account")}
                className="cursor-pointer gap-2 rounded-sm text-[13px] text-stone-700 focus:bg-stone-100 focus:text-stone-900"
              >
                <UserCircle size={15} />
                My Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-stone-100" />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-sm text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700"
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
          className="fixed inset-0 z-40 bg-stone-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 overflow-hidden bg-stone-950 transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBackgroundVideo active={!isDesktop && open} />
        <SidebarContent />
      </div>

      {/* Desktop persistent sidebar */}
      <div className="relative hidden h-screen overflow-hidden bg-stone-950 lg:flex">
        <SidebarBackgroundVideo active={isDesktop} />
        <SidebarContent />
      </div>
    </>
  );
}

/**
 * Campus video behind the sidebar, dimmed heavily so navigation stays legible.
 * Declared at module level so it is not remounted (and restarted) whenever the
 * sidebar re-renders. Plays only while `active`, so the hidden copy stays paused.
 */
function SidebarBackgroundVideo({ active }: { active: boolean }) {
  const { videoRef } = useBackgroundVideo(active);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={BACKGROUND_VIDEO_SRC}
        poster={BACKGROUND_VIDEO_POSTER}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-stone-950/85" aria-hidden="true" />
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
      className={`flex shrink-0 items-center justify-center rounded-full bg-stone-700 font-semibold text-white ${sizes[size]}`}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}