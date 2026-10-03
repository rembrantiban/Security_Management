import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 py-16 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              On duty today?
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Sign in with the account issued by the security office.
            </p>
          </div>
          <Link
            to="/login"
            className="group inline-flex w-fit items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
          >
            Sign in
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="flex flex-col gap-4 py-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/sfc.png" alt="" className="h-6 w-6 object-contain" />
            <span>
              © {new Date().getFullYear()} Saint Francis College · Campus
              Security Office
            </span>
          </div>
          <nav className="flex gap-6" aria-label="Footer">
            <a href="#modules" className="hover:text-white">
              Modules
            </a>
            <a href="#workflow" className="hover:text-white">
              Workflow
            </a>
            <a href="#roles" className="hover:text-white">
              Roles
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
