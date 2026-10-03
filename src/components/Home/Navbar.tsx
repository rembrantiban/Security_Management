import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#modules", label: "Modules" },
  { href: "#workflow", label: "Workflow" },
  { href: "#roles", label: "Roles" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // White once the page is scrolled (or the mobile menu is open);
  // transparent over the hero video at the very top.
  const solid = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        solid
          ? "border-b border-stone-200 bg-white text-stone-900"
          : "border-b border-transparent bg-transparent text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/sfc.png" alt="" className="h-8 w-8 object-contain bg-white rounded-full" />
          <span className="text-[15px] font-semibold tracking-tight">
            SFC Security
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                solid
                  ? "text-stone-600 hover:text-stone-900"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className={`hidden rounded-md px-4 py-2 text-sm font-medium transition-colors md:inline-block ${
              solid
                ? "bg-stone-900 text-white hover:bg-stone-700"
                : "bg-white text-stone-900 hover:bg-stone-200"
            }`}
          >
            Sign in
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`rounded-md p-2 transition-colors md:hidden ${
              solid ? "hover:bg-stone-100" : "hover:bg-white/10"
            }`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-stone-200 bg-white px-5 pb-5 pt-2 md:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block border-b border-stone-100 py-3 text-sm text-stone-700 transition-colors hover:text-stone-900"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="mt-4 block rounded-md bg-stone-900 py-2.5 text-center text-sm font-medium text-white"
          >
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
