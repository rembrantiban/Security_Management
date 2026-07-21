import {
  ArrowLeft,
  Shield,
  User,
  UserCheck,
  Mail,
  AtSign,
  Calendar,
  Clock,
  Activity,
  Pencil,
  Trash2,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ViewEditUserDialog from "@/components/User/ViewEditUserDialog";
import { useAuth } from "@/hooks/useAuth";
import type { Users } from "@/store/useAuthStore";
import { useToast } from "@/hooks/useToast"
import ViewDeleteUserDialog from "@/components/User/ViewDeleteUserDialog";
const roleConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string; ring: string }
> = {
  Administrator: {
    label: "Administrator",
    icon: <Shield size={14} />,
    color: "text-violet-700",
    bg: "bg-violet-100",
    ring: "ring-violet-200",
  },
  "Authorized Staff": {
    label: "Authorized Staff",
    icon: <UserCheck size={14} />,
    color: "text-blue-700",
    bg: "bg-blue-100",
    ring: "ring-blue-200",
  },
  "Security Personnel": {
    label: "Security Personnel",
    icon: <User size={14} />,
    color: "text-orange-700",
    bg: "bg-orange-100",
    ring: "ring-orange-200",
  },
};

export default function ViewUserPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const { showToast } = useToast();
  const { deleteUser } = useAuth();


  const { user_id } = useParams();

  const { selectedUserById, getUserById, isLoading, } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (selectedUserById) {
      setSelectedUser(selectedUserById);
    }
  }, [selectedUserById]);

  useEffect(() => {
    if (user_id) {
      getUserById(Number(user_id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);

  if (isLoading) {
    return <ViewUserSkeleton />;
  }

  if (!selectedUserById) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        User not found.
      </div>
    );
  }

  const user = selectedUserById;

  const handleSuccess = () => {
    showToast(
      "success",
      "User Updated",
      "The user account has been updated successfully."
    );
  };

  const handleError = (message: string) => {
    showToast(
      "error",
      "Update Failed",
      message
    );
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">User not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-orange-700">
          Go back
        </Button>
      </div>
    );
  }

  const role = roleConfig[user.role] ?? roleConfig["Security Personnel"];
  const initials = `${user.first_name[0]}${user.last_name[0]}`;

  const fmt = (date: string | null) =>
    date
      ? new Date(date).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "Never";


  const handleDelete = async () => {
    if (!selectedUser) return;

    const success = await deleteUser(selectedUser.user_id);

    if (success) {
      setDeleteOpen(false);

      showToast(
        "success",
        "User Deleted",
        "The user account has been deleted successfully."
      );

      setTimeout(() => {
        navigate("/users");
      }, 800);
    } else {
      showToast(
        "error",
        "Delete Failed",
        "Unable to delete the selected user."
      );
    }
  };
  return (
    <div className="max-w-6xl mx-auto bg-white/10 px-4 sm:px-6 py-4 space-y-5">

      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-700 transition group"
      >
        <span className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-orange-100 group-hover:text-orange-700 transition">
          <ArrowLeft size={14} />
        </span>
        <span>Back to Users</span>
      </button>

      {/* Profile hero card */}
      <div className="relative bg-white  rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-linear-to-r from-orange-700 via-amber-700 to-orange-600" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-5">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-orange-800 to-amber-600 text-white text-2xl font-bold flex items-center justify-center ring-4 ring-white shadow-lg shadow-orange-900/20 shrink-0">
                {initials}
              </div>

              <div className="mt-2">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-gray-400">@{user.username}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:mb-1">
              <Button
                onClick={() => { setSelectedUser(user); setOpen(true); }}
                variant="outline"
                size="sm"
                className="rounded-xl border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 gap-1.5"
              >
                <Pencil size={13} />
                Edit
              </Button>
              <Button
                onClick={() => {
                  setSelectedUser(user);
                  setDeleteOpen(true);
                }}
                variant="outline"
                size="sm"
                className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 gap-1.5"
              >
                <Trash2 size={13} />
                Delete
              </Button>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ${role.bg} ${role.color} ${role.ring}`}
            >
              {role.icon}
              {role.label}
            </span>

            {user.status ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 size={12} />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                <Ban size={12} />
                Deactivate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <InfoCard
          icon={<Mail size={15} className="text-orange-600" />}
          label="Email address"
          value={user.email}
        />

        <InfoCard
          icon={<AtSign size={15} className="text-orange-600" />}
          label="Username"
          value={`@${user.username}`}
        />

        <InfoCard
          icon={<Calendar size={15} className="text-orange-600" />}
          label="Account created"
          value={fmt(user.created_at)}
        />

        <InfoCard
          icon={<Clock size={15} className="text-orange-600" />}
          label="Last login"
          value={fmt(user.last_login)}
        />
      </div>

      {/* Activity summary strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-orange-600" />
          <h2 className="text-sm font-semibold text-gray-700">Account Summary</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat
            label="Status"
            value={user.status ? "Active" : "Deactivate"}
            valueClass={user.status ? "text-emerald-600" : "text-red-500"}
          />
          <Stat label="Role" value={role.label} />
          <Stat
            label="Has logged in"
            value={user.last_login ? "Yes" : "No"}
            valueClass={user.last_login ? "text-emerald-600" : "text-gray-400"}
          />
        </div>
      </div>
      <ViewEditUserDialog
        open={open}
        onOpenChange={setOpen}
        user={selectedUser}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <ViewDeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Small reusable pieces ── */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-3">
      <div className="mt-0.5 p-2 rounded-xl bg-orange-50 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass = "text-gray-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function ViewUserSkeleton() {
  return (
    <div className="max-w-6xl mx-auto bg-white/10 px-4 sm:px-6 py-4 space-y-5 animate-pulse">

      {/* Back nav */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-gray-100" />
        <span className="h-3.5 w-24 rounded bg-gray-100" />
      </div>

      {/* Profile hero card */}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-linear-to-r from-orange-200 via-amber-100 to-orange-100" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-5">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 ring-4 ring-white shadow-lg shrink-0" />

              <div className="mt-2 space-y-2">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:mb-1">
              <div className="h-8 w-20 rounded-xl bg-gray-100" />
              <div className="h-8 w-20 rounded-xl bg-gray-100" />
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="h-6 w-32 rounded-full bg-gray-100" />
            <div className="h-6 w-20 rounded-full bg-gray-100" />
            <div className="h-4 w-14 rounded bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-3"
          >
            <div className="mt-0.5 p-2 rounded-xl bg-gray-100 shrink-0">
              <div className="w-3.75 h-3.75" />
            </div>
            <div className="min-w-0 space-y-2 w-full">
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-3.5 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity summary strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3.75 h-3.75 rounded bg-gray-100" />
          <div className="h-3.5 w-28 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-14 rounded bg-gray-100" />
              <div className="h-3.5 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}