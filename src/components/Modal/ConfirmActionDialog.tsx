import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmActionTone = "danger" | "success";

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: ConfirmActionTone;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  loadingLabel: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  /** Optional context shown between the description and the actions (e.g. the target user). */
  children?: ReactNode;
};

const TONE_STYLES: Record<ConfirmActionTone, { iconWrap: string; icon: string; button: string }> = {
  danger: {
    iconWrap: "bg-red-50 ring-red-100",
    icon: "text-red-600",
    button: "bg-red-600 text-white hover:bg-red-700",
  },
  success: {
    iconWrap: "bg-emerald-50 ring-emerald-100",
    icon: "text-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
};

/**
 * Compact confirmation dialog for destructive or state-changing actions
 * (delete, activate/deactivate). Locks closing while the action is in flight.
 */
export default function ConfirmActionDialog({
  open,
  onOpenChange,
  tone,
  icon: Icon,
  title,
  description,
  confirmLabel,
  loadingLabel,
  loading = false,
  onConfirm,
  children,
}: ConfirmActionDialogProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) onOpenChange(value);
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 rounded-2xl p-6 sm:max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ring-8 ${styles.iconWrap}`}
          >
            <Icon className={`h-6 w-6 ${styles.icon}`} aria-hidden="true" />
          </div>

          <DialogTitle className="mt-4 text-lg font-semibold text-slate-900">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {description}
          </DialogDescription>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            className={`rounded-xl ${styles.button}`}
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small summary row identifying the user an action targets. */
export function ConfirmTargetUser({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase text-slate-600">
        {name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{email}</p>
      </div>
    </div>
  );
}
