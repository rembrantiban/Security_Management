import { Mail, Lock } from "lucide-react";


type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className=" p-3 rounded-xl shadow-sm mb-3">
            <img src="./logo.png" alt="SECURA Logo" className="h-20 w-20"/>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">SECURA</h2>
          <p className="text-gray-500 text-sm">Secure Access Portal</p>
        </div>

        {/* FORM */}
        <form className="space-y-4">
          
          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OPTIONS */}
         

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Login
          </button>

          <h3 className="text-sm text-center">Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a></h3>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Secure system access only
        </p>
      </div>
    </div>
  );
}