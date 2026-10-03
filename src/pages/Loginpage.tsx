import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/Auth/AuthLayout";
import {
  FormError,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/Auth/AuthFields";
import StatusModal from "@/components/Modal/StatusModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useRolePermissionStore } from "@/store/useRolePermissionStore";

const ROLE_HOME: Record<string, string> = {
  Administrator: "/dashboard",
  "Security Personnel": "/personnel/dashboard",
  "Authorized Staff": "/staff/dashboard",
  "IT System Administrator": "/it-system-administrator/rbac-policies",
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [successOpen, setSuccessOpen] = useState(false);
  const { isLoading, login, error } = useAuth();
  const { getRolePermissions } = useRolePermissionStore();
  const navigate = useNavigate();

  // The auth store's error is shared across pages; start with a clean slate.
  useEffect(() => {
    useAuthStore.getState().clearError();
  }, []);

  const isValid =
    formData.login.trim() !== "" && formData.password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loggedInUser = await login(formData.login, formData.password);
    if (!loggedInUser) return; // The store exposes the reason via `error`.

    const user = useAuthStore.getState().user;
    if (user) {
      await getRolePermissions(user.role);
    }

    setSuccessOpen(true);

    setTimeout(() => {
      navigate(ROLE_HOME[loggedInUser.role] ?? "/");
    }, 1500);
  };

  return (
    <AuthLayout headline="Incidents, shifts, patrols and visitors — in one record.">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-stone-500">
        Use the email or username issued by the security office.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
        <TextField
          id="login"
          label="Email or username"
          type="text"
          placeholder="you@sfc.edu.ph or username"
          autoComplete="username"
          autoFocus
          value={formData.login}
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <FormError message={error} />

        <SubmitButton disabled={!isValid || isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </SubmitButton>
      </form>

      <div className="mt-10 space-y-2 border-t border-stone-200 pt-6 text-sm text-stone-500">
        <p>
          No account yet?{" "}
          <Link to="/register" className="font-medium text-stone-900 underline-offset-4 hover:underline">
            Request one
          </Link>
        </p>
        <p>Forgot your password? Contact the IT System Administrator.</p>
      </div>

      <StatusModal
        isOpen={successOpen}
        type="success"
        title="Signed in"
        message="Taking you to your dashboard."
        onClose={() => setSuccessOpen(false)}
      />
    </AuthLayout>
  );
}
