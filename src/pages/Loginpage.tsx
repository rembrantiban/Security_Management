import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, TriangleAlert, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import StatusModal from "@/components/Modal/StatusModal";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, type Variants } from "framer-motion";


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



export default function LoginPage() {

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");
  const { isLoading, login, error } = useAuth();
  const navigate = useNavigate();

  const isValid =
    formData.login.trim() !== "" &&
    formData.password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.login, formData.password);

    if (!success) {
      setStatusType("error");
      setStatusMessage(error || "Login failed.");
      setStatusOpen(true);
      return;
    }

    const loggedInUser = useAuthStore.getState().user;

    setStatusType("success");
    setStatusMessage("Welcome back! Login successful.");
    setStatusOpen(true);

    setTimeout(() => {
      switch (loggedInUser?.role) {
        case "Administrator":
          navigate("/dashboard");
          break;

        case "Security Personnel":
          navigate("/personnel/dashboard");
          break;

        case "Authorized Staff":
          navigate("/staff/dashboard");
          break;

        case "IT System Administrator":
          navigate("/it-system-administrator/permissions");
          break;

        default:
          navigate("/");
      }
    }, 1500);
  };


  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">

      {/* Local keyframes for the scanline signature element */}
      <style>{`
        @keyframes sms-scan {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(110%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sms-scanline { animation: none; }
        }
      `}</style>

      {/* LEFT — security console panel */}
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        animate="show"
        className="relative hidden overflow-hidden bg-amber-950 lg:flex lg:flex-col lg:justify-between">

        {/* Faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(2245, 235, 235) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 235, 235) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Scanline sweep */}
        <div className="sms-scanline pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-orange-500/15 via-orange-500/5 to-transparent [animation:sms-scan_6s_linear_infinite]" />

        <div className="relative flex flex-1 flex-col justify-center px-14 py-16">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-100">
              <img src="./sfc.png" alt="" className="h-10 w-10" />
            </div>
            <p className="font-mono text-sm lg:text-xl uppercase tracking-[0.25em] text-orange-400">
              Security Management System
            </p>
          </div>

          <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Campus safety, monitored around the clock.
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-100">
            Sign in to log incidents, coordinate patrols, and keep every
            checkpoint on St. Francis College accounted for.
          </p>

          {/* Status readout — the signature detail */}
          <div className="mt-12 space-y-3 border-l border-slate-200 pl-5 font-mono text-xs text-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="tracking-wide text-slate-100">SYSTEM STATUS — OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-100" />
              <span className="tracking-wide">ACCESS — AUTHORIZED PERSONNEL ONLY</span>
            </div>
          </div>

        </div>

        <div className="relative border-t border-amber-600 px-14 py-6">
          <p className="font-mono text-[11px] tracking-wide text-slate-100">
            St. Francis College · Guihulngan City
          </p>
        </div>

      </motion.div>

      {/* RIGHT — form panel */}
      <motion.div
        variants={fadeRight}
        initial="hidden"
        animate="show"
        className="flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-10">

        <div className="w-full max-w-sm">

          {/* Mobile-only compact header */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src="./sfc.png" alt="SECURITY MANAGEMENT Logo" className="h-16 w-16" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">SECURITY MANAGEMENT</h2>
            <p className="text-sm text-orange-800">St. Francis College</p>
          </div>

          <div className="hidden lg:block">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-600">
              Sign in
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            {/* EMAIL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-700" size={18} />
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  Password
                </label>
                <a href="#" className="text-xs text-orange-700 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-700" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold transition
               ${!isValid || isLoading
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-orange-900 text-white hover:bg-orange-700"
                }
              `}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                <TriangleAlert className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Login Failed</p>
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <a href="/register" className="text-orange-700 hover:underline">
                Sign up
              </a>
            </p>

          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure system access only
          </p>

        </div>

      </motion.div>

      <StatusModal
        isOpen={statusOpen}
        type={statusType}
        title={statusType === "success" ? "Success" : "Login Failed"}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />

    </div>
  );
}