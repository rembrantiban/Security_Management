import { useState } from "react";
import {
    Mail,
    User,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom"
import { UserCog, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"


export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        firstName: "",
        middleName: "",
        lastName: "",
        role: "",
        password: "",
        confirmPassword: "",
    });


     const passwordsMismatch =
        formData.confirmPassword.length > 0 &&
        formData.password !== formData.confirmPassword;

      const isValid =
        formData.email.trim() !== "" &&
        formData.username.trim() !== "" &&
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.role.trim() !== "" &&
        formData.password.trim() !== "" &&
        formData.confirmPassword.trim() !== "" &&
       !passwordsMismatch;


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };  

    

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (passwordsMismatch) return;

        const success = await register({
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            password: formData.password,
        });

        if (success) {
            // Show success modal
            // Navigate to login page
        }
    };
   

    return (
        <div className="min-h-screen flex bg-amber-950">
            {/* LEFT — Brand / visual side */}
            <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-amber-950 px-12 py-16 flex-col justify-between">
                <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-amber-400/20 blur-[100px] animate-[drift_14s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-300/15 blur-[100px] animate-[drift_18s_ease-in-out_infinite_reverse]" />

                {/* Dot-grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className=" rounded-full bg-white border border-white/15">
                            <img src="/sfc.png" alt="Logo" className="w-14 h-14" />
                        </div>
                        <span className="text-white font-semibold tracking-tight text-lg">
                            Security Management
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-5">
                        Create your
                        <br />
                        account
                    </h1>
                    <p className="text-orange-100/70 text-base leading-relaxed max-w-sm">
                        Join the platform built for real-time monitoring, incident
                        tracking, and smarter access control.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                    {[
                        "Real-time monitoring dashboard",
                        "Role-based access control",
                        "Instant incident reporting",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <span className="text-orange-50/80 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT — Form side */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-amber-50 relative overflow-hidden">
                {/* Faint matching texture so the form side doesn't feel disconnected */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative z-10 w-full max-w-lg">
                    {/* Mobile-only brand mark */}
                    <div className="lg:hidden flex flex-col items-center mb-4 justify-center">
                        <div className=" bg-white/10 border border-white/15">
                            <img src="./sfc.png" alt="Logo" className="w-14 h-14" />
                        </div>
                        <span className="text-orange-800 font-semibold tracking-tight">
                            Security Management
                        </span>
                    </div>

                    <div className="p-8 md:p-10 rounded bg-white/6 backdrop-blur-xl border border-white/12 shadow shadow-black/30">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-orange-950 tracking-tight mb-1.5">
                                Register an account
                            </h2>
                            <p className="text-orange-500 text-sm">
                                Fill in your details to get started.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <Field
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                icon={<Mail size={17} />}
                            />

                            {/* Username */}
                            <Field
                                label="Username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                icon={<User size={17} />}
                            />

                            {/* Name row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Field
                                    label="First name"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Juan"
                                />
                                <Field
                                    label="Middle name"
                                    name="middleName"
                                    type="text"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                    optional
                                />
                                <div className="col-span-2 sm:col-span-1">
                                    <Field
                                        label="Last name"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Dela Cruz"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-orange-800 mb-1.5">
                                    Role
                                </label>

                                <div className="relative">
                                    <UserCog
                                        size={17}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-700 z-10"
                                    />

                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                role: e.target.value,
                                            })
                                        }
                                        required
                                        className=" appearance-none  w-full pl-10 pr-12 py-3 rounded-xl bg-white  border  border-orange-200 shadow-sm text-sm text-orange-900 outline-none transition-all duration-200 hover:border-orange-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 "
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Security Personnel">
                                            Security Personnel
                                        </option>
                                        <option value="Authorized Staff">
                                            Authorized Staff
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={18}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none"
                                    />
                                </div>
                            </div>
                            {/* Password */}
                            <Field
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                icon={<Lock size={17} />}
                                rightAction={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="text-orange-100/50 hover:text-amber-300 transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                }
                            />

                            {/* Confirm password */}
                            <Field
                                label="Confirm password"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                icon={<Lock size={17} />}
                                error={passwordsMismatch ? "Passwords don't match" : undefined}
                                rightAction={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className="text-orange-100/50 hover:text-amber-300 transition-colors"
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                }
                            />

                            <button
                                type="submit"
                                disabled={!isValid || isLoading}
                                className={`
                                group w-full flex items-center justify-center
                                gap-2 rounded-xl py-3.5 font-semibold
                                transition-all

                                ${!isValid || isLoading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-amber-900 text-white hover:bg-amber-800"
                                    }
                                     `}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-orange-100/50 mt-7">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-amber-300 font-medium hover:text-amber-200 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
      `}</style>
        </div>
    );
}

/* Reusable field component — keeps the form markup readable */
function Field({
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    icon,
    rightAction,
    optional,
    error,
}: {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    rightAction?: React.ReactNode;
    optional?: boolean;
    error?: string;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="block text-xs font-medium text-orange-800 mb-1.5"
            >
                {label}
                {optional && (
                    <span className="text-orange-100/40 font-normal"> (optional)</span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-100/40">
                        {icon}
                    </span>
                )}
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={!optional}
                    className={`w-full ${icon ? "pl-10" : "pl-3.5"
                        } ${rightAction ? "pr-10" : "pr-3.5"} py-2.5 rounded-xl bg-orange-300/10 border ${error
                            ? "border-red-400/60 focus:border-red-400"
                            : "border-orange-500/30 focus:border-amber-300/50"
                        } text-orange-800 text-sm placeholder:text-orange-900/30 outline-none transition-colors focus:bg-white/6`}
                />
                {rightAction && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {rightAction}
                    </span>
                )}
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>
    );
}