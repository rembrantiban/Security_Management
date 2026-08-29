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

/** Roles that see the notifications bell. */
const NOTIFICATION_ROLES = new Set(["Authorized Staff", "Security Personnel"]);

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const getTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/dashboard/users") return "User Management";
    if (location.pathname === "/dashboard/logs") return "Security Logs";
    if (location.pathname === "/dashboard/incidents") return "Incidents";
    if (location.pathname === "/dashboard/access") return "Access & Visitors";
    if (location.pathname === "/dashboard/settings") return "Settings";
    return "Security Management System";
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
    navigate("/");
  };

  return (
    <header className="flex h-15 w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm">

      {/* LEFT: menu + title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold leading-tight text-slate-800">
            {getTitle()}
          </h1>
          <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">

        {/* Notifications — Authorized Staff & Security Personnel only */}
        {showNotifications && <NotificationBell />}

        {/* Divider */}
        <div className="mx-0.5 hidden h-6 w-px bg-slate-200 sm:block" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="group flex items-center gap-2.5 rounded-xl p-1 pr-1.5 transition hover:bg-slate-50 sm:pr-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[12px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                {initials}
              </span>

              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[160px] truncate text-[12.5px] font-medium leading-none text-slate-800">
                  {fullName}
                </span>
                <span className="mt-1 block max-w-[160px] truncate text-[11px] text-slate-400">
                  {role}
                </span>
              </span>

              <ChevronDown
                size={14}
                className="hidden shrink-0 text-slate-400 transition group-hover:text-slate-600 sm:block"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-slate-200"
          >
            <div className="mb-1 flex items-center gap-2.5 px-2.5 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[12px] font-semibold text-amber-50">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-800">
                  {fullName}
                </p>
                <p className="truncate text-[11px] text-slate-400">{role}</p>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={() => navigate(profilePath)}
              className="cursor-pointer gap-2 rounded-lg text-[13px] text-slate-700 focus:bg-amber-50 focus:text-amber-800"
            >
              <UserCircle size={15} />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="cursor-pointer gap-2 rounded-lg text-[13px] text-red-500 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut size={15} />
              Logout
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
