import { useState } from "react";
import { Menu, ChevronDown, UserCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutDialog from "@/components/LogoutModal/LogoutModal";
import NotificationBell from "@/components/layout/NotificationBell";

type TopbarProps = {
  onMenuClick: () => void;
};

/** Page titles shown in the topbar, keyed by route. */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/incidents": "Incidents",
  "/monitoring": "Monitoring",
  "/access": "Access Register",
  "/visitor-history": "Visitor History",
  "/blacklist": "Blacklisted Visitors",
  "/reports": "Reports & Logs",
  "/record": "Records",
  "/notifications": "Notifications",
  "/my-account": "My Account",
  "/other-role-account": "My Account",
  "/personnel/dashboard": "Dashboard",
  "/personnel/incidents": "Incidents",
  "/personnel/surveillance": "Assigned Areas",
  "/personnel/patrols": "Patrols",
  "/personnel/visitors": "Visitors",
  "/personnel/reports": "Patrol Reports",
  "/personnel/notifications": "Notifications",
  "/staff/dashboard": "Dashboard",
  "/staff/incidents": "Incident Reports",
  "/it-system-administrator/rbac-policies": "RBAC Policies",
  "/it-system-administrator/permission-matrix": "Permission Matrix",
  "/it-system-administrator/security-settings": "Security Settings",
};

/** Roles that see the notifications bell. */
const NOTIFICATION_ROLES = new Set(["Authorized Staff", "Security Personnel"]);

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const getTitle = () => {
    if (location.pathname.startsWith("/users/view/")) return "User Details";
    return PAGE_TITLES[location.pathname] ?? "SFC Security";
  };

  const getSubtitle = () =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const role = user?.role ?? "—";
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  const showNotifications = !!user?.role && NOTIFICATION_ROLES.has(user.role);
  const profilePath =
    user?.role === "Administrator" ? "/my-account" : "/other-role-account";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">

      {/* LEFT: menu + title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-md p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-stone-900">
            {getTitle()}
          </h1>
          <p className="mt-0.5 hidden text-xs text-stone-500 sm:block">
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">

        {/* Notifications — Authorized Staff & Security Personnel only */}
        {showNotifications && <NotificationBell />}

        {/* Divider */}
        <div className="mx-1 hidden h-6 w-px bg-stone-200 sm:block" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="group flex items-center gap-2.5 rounded-md p-1 pr-1.5 transition-colors hover:bg-stone-100 sm:pr-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                {initials}
              </span>

              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-40 truncate text-[13px] font-medium leading-none text-stone-900">
                  {fullName}
                </span>
                <span className="mt-1 block max-w-40 truncate text-[11px] text-stone-500">
                  {role}
                </span>
              </span>

              <ChevronDown
                size={14}
                className="hidden shrink-0 text-stone-400 transition-colors group-hover:text-stone-600 sm:block"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-md border border-stone-200 p-1 shadow-lg"
          >
            <div className="mb-1 flex items-center gap-2.5 px-2.5 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[12px] font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-stone-900">
                  {fullName}
                </p>
                <p className="truncate text-[11px] text-stone-500">{role}</p>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-stone-100" />

            <DropdownMenuItem
              onClick={() => navigate(profilePath)}
              className="cursor-pointer gap-2 rounded-sm text-[13px] text-stone-700 focus:bg-stone-100 focus:text-stone-900"
            >
              <UserCircle size={15} />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-stone-100" />

            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="cursor-pointer gap-2 rounded-sm text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut size={15} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </header>
  );
}
