import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/Auth/AuthLayout";
import {
  FormError,
  INPUT_CLASS,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/Auth/AuthFields";
import StatusModal from "@/components/Modal/RegisterStatusModal";
import { useAuthStore } from "@/store/useAuthStore";

const SELF_REGISTER_ROLES = ["Security Personnel", "Authorized Staff"] as const;

const INITIAL_FORM = {
  email: "",
  username: "",
  firstName: "",
  middleName: "",
  lastName: "",
  role: "",
  password: "",
  confirmPassword: "",
};

type RegisterForm = typeof INITIAL_FORM;

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>(INITIAL_FORM);
  const [successOpen, setSuccessOpen] = useState(false);

  // The auth store's error is shared across pages; start with a clean slate.
  useEffect(() => {
    useAuthStore.getState().clearError();
  }, []);

  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const requiredFields: (keyof RegisterForm)[] = [
    "email",
    "username",
    "firstName",
    "lastName",
    "role",
    "password",
    "confirmPassword",
  ];

  const isValid =
    requiredFields.every((field) => formData[field].trim() !== "") &&
    !passwordsMismatch;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const success = await register({
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      role: formData.role,
      password: formData.password,
    });

    if (!success) return; // The store exposes the reason via `error`.

    setSuccessOpen(true);
    setTimeout(() => {
      setSuccessOpen(false);
      navigate("/login");
    }, 2500);
  };

  return (
    <AuthLayout
      headline="Accounts are reviewed by the security office before they are activated."
      formWidth="md"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Request an account</h1>
      <p className="mt-2 text-sm text-stone-500">
        An administrator will approve your request before you can sign in.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            name="firstName"
            label="First name"
            placeholder="Juan"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            id="lastName"
            name="lastName"
            label="Last name"
            placeholder="Dela Cruz"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <TextField
          id="middleName"
          name="middleName"
          label="Middle name"
          optional
          placeholder="Santos"
          autoComplete="additional-name"
          value={formData.middleName}
          onChange={handleChange}
        />

        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@sfc.edu.ph"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="username"
            name="username"
            label="Username"
            placeholder="juan.delacruz"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
          />

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-stone-700">
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${INPUT_CLASS} appearance-none border-stone-300 pr-10 focus:border-stone-900 focus:ring-stone-900 ${
                  formData.role ? "" : "text-stone-400"
                }`}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {SELF_REGISTER_ROLES.map((role) => (
                  <option key={role} value={role} className="text-stone-900">
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={passwordsMismatch ? "Passwords don't match." : undefined}
        />

        <FormError message={error} />

        <SubmitButton disabled={!isValid || isLoading}>
          {isLoading ? "Sending request…" : "Send request"}
        </SubmitButton>
      </form>

      <p className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-stone-900 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <StatusModal
        isOpen={successOpen}
        type="success"
        title="Request sent"
        message="Your account is pending approval. You'll be able to sign in once an administrator approves it."
        onClose={() => setSuccessOpen(false)}
      />
    </AuthLayout>
  );
}
