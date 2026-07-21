import { useAuth } from "@/hooks/useAuth"
import { ShieldCheck } from "lucide-react"

const Personneldashboardheader = () => {
    const { user } = useAuth();

    return (
        <div className="relative overflow-hidden rounded border border-slate-300 bg-white shadow-sm">

            {/* Soft decorative accent instead of a flat gradient wash */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-2 h-32 w-32 rounded-full bg-amber-200/50 blur-2xl" />

            <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="space-y-2.5">

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Security Management Dashboard
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Welcome back, {user?.first_name || "User"} 👋
                    </h1>

                    <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                        View real-time security analytics, monitor personnel activities,
                        manage incidents, and oversee campus surveillance from one centralized dashboard.
                    </p>

                </div>

                <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-2.5">

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        System Operational
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Personneldashboardheader