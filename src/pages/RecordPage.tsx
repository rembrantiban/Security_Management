import { Construction, Hammer, Clock3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * Administrator → Record.
 * Placeholder screen while the records module is still being built.
 */
export default function RecordPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />
                <div className="relative flex flex-col gap-1 p-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                        <Clock3 className="h-3 w-3" />
                        Coming Soon
                    </span>
                    <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                        Record
                    </h1>
                    <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                        A consolidated view of security records. This module is currently
                        under development.
                    </p>
                </div>
            </div>

            {/* Under-development card */}
            <div className="rounded-2xl bg-white/50 py-16 px-6 text-center shadow-sm ring-1 ring-slate-200">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
                    <Construction className="h-6 w-6 text-amber-800" />
                    <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                        <Hammer className="h-3 w-3 text-slate-500" />
                    </span>
                </div>

                <p className="mt-4 text-[14px] font-semibold text-slate-800">
                    This page is under development
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-slate-800">
                    We&apos;re still building the Record module. Check back soon &mdash;
                    it&apos;ll be available in an upcoming release.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Work in progress
                </div>

                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="h-9 gap-2 rounded-xl border-slate-200 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Go back
                    </Button>
                </div>
            </div>
        </div>
    );
}
