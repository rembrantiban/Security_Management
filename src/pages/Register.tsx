import { useState } from "react";
import {
    Mail,
    User,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Radar,
    TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom"
import { UserCog, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatusModal from "@/components/Modal/RegisterStatusModal";

const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

const fadeLeft: Variants = {
    hidden: {
        opacity: 0,
        x: -50,
    },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
        },
    },
};

const fadeRight: Variants = {
    hidden: {
        opacity: 0,
        x: 50,
    },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
        },
    },
};

const containerVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const features = [
    {
        title: "Real-time Monitoring",
        description: "Monitor security operations and personnel instantly.",
        icon: Radar,
    },
    {
        title: "Role-based Access",
        description: "Secure permissions for administrators and personnel.",
        icon: ShieldCheck,
    },
    {
        title: "Incident Reporting",
        description: "Report and respond to incidents in real time.",
        icon: TriangleAlert,
    },
];

export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const [statusModal, setStatusModal] = useState({
        open: false,
        type: "success" as "success" | "error",
        title: "",
        message: "",
    });

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
            setTimeout(() => {
                setStatusModal((prev) => ({ ...prev, open: false }));
                navigate("/login");
            }, 2000);
            setStatusModal({
                open: true,
                type: "success",
                title: "Account Created!",
                message:
                    "Your account has been created successfully. You can now sign in.",
            });
        } else {
            setStatusModal({
                open: true,
                type: "error",
                title: "Registration Failed",
                message:
                    "Unable to create your account. Please try again.",
            });
        }
    };

    return (
        <div className="min-h-screen flex bg-amber-950">
            {/* LEFT — Brand / visual side */}
            <motion.div variants={fadeLeft} initial="hidden" animate="show" className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-amber-950 px-12 py-16 flex-col justify-center">
                <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-amber-400/20 blur-[100px] animate-[drift_14s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-300/15 blur-[100px] animate-[drift_18s_ease-in-out_infinite_reverse]" />

                {/* Grid texture — matches the login page's left panel */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                    }}
                />

                <div className="relative z-10 mb-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="rounded-sm bg-amber-100 border border-white/15">
                            <img src="/sfc.png" alt="Logo" className="w-12 h-12" />
                        </div>
                        <span className="text-amber-500 font-semibold tracking-tight text-xl">
                            Security Management System
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

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 grid gap-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                variants={fadeUp}
                                whileHover={{ y: -5, scale: 1.02, }}
                                key={feature.title}
                                className="          
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    p-4
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-amber-300/40
                    hover:bg-white/15
                    hover:shadow-xl
                "
                            >
                                <div
                                    className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-linear-to-br
                        from-amber-400
                        to-orange-500
                        text-white
                        shadow-lg
                        transition-transform
                        duration-300
                        group-hover:scale-110
                    "
                                >
                                    <Icon className="h-6 w-6" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-white">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-orange-100/80">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>

            {/* RIGHT — Form side */}
            <motion.div variants={fadeRight} initial="hidden" animate="show" className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 bg-white relative overflow-hidden">
                {/* Faint matching grid so the form side doesn't feel disconnected */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(154,52,18,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(154,52,18,0.6) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                    }}
                />

                <div className="relative z-10 w-full max-w-lg">
                    {/* Mobile-only brand mark */}
                    <div className="lg:hidden flex flex-col items-center mb-6 justify-center">
                        <div className="p-1.5 rounded-full bg-white border border-orange-100 shadow-sm">
                            <img src="./sfc.png" alt="Logo" className="w-11 h-11" />
                        </div>
                        <span className="text-orange-950 font-semibold tracking-tight mt-2">
                            Security Management System
                        </span>
                    </div>

                    <div className="rounded-3xl  bg-white  p-6 sm:p-8 md:p-10">

                        <div className="mb-7">
                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-orange-500">
                                Get started
                            </p>
                            <h2 className="text-2xl font-bold text-orange-950 tracking-tight mt-1 mb-1.5">
                                Register an account
                            </h2>
                            <p className="text-orange-600/70 text-sm">
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
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 z-10"
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
                                        className="appearance-none w-full pl-10 pr-12 py-2.5 rounded bg-white border border-slate-200 shadow-sm text-sm text-orange-900 outline-none transition-all duration-200 hover:border-orange-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"
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
                                        className="text-orange-300 hover:text-orange-600 transition-colors"
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
                                        className="text-orange-300 hover:text-orange-600 transition-colors"
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
                                gap-2 rounded-xl py-2.5 font-semibold
                                transition-all shadow-sm

                                ${!isValid || isLoading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-amber-900 text-white hover:bg-amber-800 hover:shadow-md"
                                    }
                                     `}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-orange-600/60 mt-7">
                            Already have an account?{" "}
                            <Link
                                to="/"
                                className="text-orange-700 font-medium hover:text-orange-900 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
                <StatusModal
                    isOpen={statusModal.open}
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                    onClose={() => {
                        setStatusModal((prev) => ({
                            ...prev,
                            open: false,
                        }))
                    }}
                />
            </motion.div>

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
                className="block text-xs font-medium text-slate-800 mb-1.5"
            >
                {label}
                {optional && (
                    <span className="text-orange-400 font-normal"> (optional)</span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400">
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
                        } ${rightAction ? "pr-10" : "pr-3.5"} py-2.5 rounded bg-white border ${error
                            ? "border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        } text-orange-900 text-sm placeholder:text-orange-900/30 outline-none shadow-sm transition-all hover:border-orange-300`}
                />
                {rightAction && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {rightAction}
                    </span>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}