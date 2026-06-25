import { useState } from "react";
import LoginModal from "../Modal/loginModal";
import { User, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#mission", label: "Mission" },
    { href: "#about", label: "About" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3 md:px-10">
          {/* Logo + title block */}
          <div className="flex items-center gap-3">
            <img
              src="/sfc.png"
              alt="Saint Francis College Logo"
              className="h-11 w-11 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                Security
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-800">
                Saint Francis
              </span>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center justify-around gap-1 rounded-full w-xl border border-slate-200 bg-slate-50/80 px-1.5 py-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="group hidden items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 md:flex"
            >
              <User size={16} className="transition-transform group-hover:scale-110" />
              Login
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="flex items-center justify-center rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileOpen ? "max-h-80 border-t border-slate-200" : "max-h-0"
            }`}
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setIsLoginOpen(true);
                setIsMobileOpen(false);
              }}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <User size={16} />
              Login
            </button>
          </div>
        </div>
      </nav >

      {/* IMPORTANT: Modal stays outside nav */}
      < LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)
      } />
    </>
  );
}