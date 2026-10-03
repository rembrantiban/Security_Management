import type { ReactNode } from "react";

/**
 * Standard page header used across every dashboard page.
 *
 * Plain type on the page background — no banner — so it reads like the
 * public landing page: small orange eyebrow, a strong title, a muted
 * description, and an optional actions slot aligned to the right.
 */

type PageHeaderProps = {
  /** Short context label above the title, e.g. "Security operations". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot for buttons, counters or toggles. */
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

/** Solid dark button for the header's main action. */
export const HEADER_PRIMARY_BUTTON =
  "inline-flex h-9 items-center justify-center gap-2 transition-colors disabled:pointer-events-none disabled:opacity-50 rounded-md bg-stone-900 px-4 text-[13px] font-medium text-white shadow-none hover:bg-stone-700";

/** Outlined button for secondary header actions. */
export const HEADER_SECONDARY_BUTTON =
  "inline-flex h-9 items-center justify-center gap-2 transition-colors disabled:pointer-events-none disabled:opacity-50 rounded-md border border-stone-300 bg-white px-3.5 text-[13px] font-medium text-stone-700 shadow-none hover:bg-stone-50 hover:text-stone-900";

/** Secondary button in its "on" state (used for view toggles). */
export const HEADER_TOGGLE_ACTIVE_BUTTON =
  "inline-flex h-9 items-center justify-center gap-2 transition-colors rounded-md border border-stone-900 bg-stone-900 px-3.5 text-[13px] font-medium text-white shadow-none hover:bg-stone-700 hover:text-white";

/** Small read-only stat shown in the actions slot. */
export function HeaderStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-20 rounded-md border border-stone-200 bg-white px-3 py-1.5">
      <p className="text-[10.5px] uppercase tracking-wide text-stone-500">{label}</p>
      <p className="text-base font-semibold tabular-nums text-stone-900">{value}</p>
    </div>
  );
}

