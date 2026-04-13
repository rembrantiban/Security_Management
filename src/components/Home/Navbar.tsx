import { useState } from "react";
import LoginModal from "../Modal/loginModal";
import { User } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">SECURA</h1>

        <div className="hidden md:flex gap-6 text-gray-600">
          <a href="#home" className="hover:text-blue-500 transition">Home</a>
          <a href="#features" className="hover:text-blue-500 transition">Features</a>
          <a href="#mission" className="hover:text-blue-500 transition">Mission</a>
          <a href="#about" className="hover:text-blue-500 transition">About</a>
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
        <User size={20}/>
          Login
        </button>
      </nav>

      {/* IMPORTANT: Move modal OUTSIDE nav */}
      <LoginModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}