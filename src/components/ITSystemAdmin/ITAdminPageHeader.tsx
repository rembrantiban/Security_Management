import type { LucideIcon } from "lucide-react";

/**
 * Shared header for the IT / System Administrator console pages.
 *
 * Keeps RBAC Policies (2.28), Permission Matrix (2.29), and Security Settings
 * (2.30) visually consistent — one amber banner, one spec reference badge.
 */

type ITAdminPageHeaderProps = {
    /** Functional-spec reference, e.g. "2.28". */
    reference: string;
    title: string;
    description: string;
    icon: LucideIcon;
    /** Optional right-aligned slot (actions, counters, tabs). */
    actions?: React.ReactNode;
};

export default function ITAdminPageHeader({
    reference,
    title,
    description,
    icon: Icon,
    actions,
}: ITAdminPageHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm ring-1 ring-black/5">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

            <div className="relative flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-100 ring-1 ring-white/15">
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                            IT / System Administrator · {reference}
                        </span>

                        <h1 className="mt-2.5 text-[18px] font-semibold tracking-tight text-white">
                            {title}
                        </h1>

                        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-amber-100/70">
                            {description}
                        </p>
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
