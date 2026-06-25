import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import StatusModal from "./StatusModal"
import { useNavigate } from "react-router";


type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {

  const [formData, setFormData] = useState({
    login: "",
    password: ""
  });
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");
  const { isLoading, login, error } = useAuth()
  const navigate = useNavigate()
  const isValid =
    formData.login.trim() !== "" &&
    formData.password.trim() !== "";

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const success = await login(
      formData.login,
      formData.password
    );

    if (success) {
      setStatusType("success");
      setStatusMessage(
        "Welcome back! Login successful."
      );
      setStatusOpen(true);
        setTimeout(() => {
      onClose();
      navigate("/dashboard");
    }, 1500);
    } else {
      setStatusType("error");
      setStatusMessage(
        error || "Login failed."
      );
      setStatusOpen(true);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2">

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-sm shadow-2xl p-5">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className=" p-3">
            <img src="./sfc.png" alt="SECURITY MANAGEMENT Logo" className="h-20 w-20" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">SECURITY MANAGEMENT</h2>
          <p className="text-orange-800 text-sm">St Francis College</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-orange-700" size={18} />
            <input
              type="text"
              placeholder="Email or Username"
              className="w-full pl-10 pr-3 py-2 placeholder:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-orange-700" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-2 py-2 rounded-lg border placeholder:text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* OPTIONS */}
          <div className="flex items-center justify-end">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-2 rounded-lg font-semibold transition
             ${!isValid || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-900 text-white hover:bg-orange-700"
              }
            `}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <h3 className="text-sm text-center">Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a></h3>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Secure system access only
        </p>
      </div>
      <StatusModal
        isOpen={statusOpen}
        type={statusType}
        title={
          statusType === "success"
            ? "Success"
            : "Login Failed"
        }
        message={statusMessage}
        onClose={() => {
          setStatusOpen(false);

          if (statusType === "success") {
            onClose();
          }
        }}
      />
    </div>
  );
}