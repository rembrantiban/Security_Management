import { useState } from "react";
import { Mail, ChevronDown, Loader2 } from "lucide-react";
import type { Users } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";

type ApprovalStatus = "Approved" | "Rejected";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Users | null;
};

export default function AccountApproval({ open, onOpenChange, user }: Props) {
  const [status, setStatus] = useState<ApprovalStatus>("Approved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateApprovalStatus } = useAuth();
  const { showToast } = useToast();

  if (!open || !user) return null;

  const statusStyles: Record<ApprovalStatus, string> = {
    Approved: "bg-green-50 text-green-800 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

 const handleConfirm = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    const success = await updateApprovalStatus(
        user.user_id,
        status
    );

    setIsSubmitting(false);

    if (success) {
        showToast(
            "success",
            `Account ${status}`,
            `${user.first_name} ${user.last_name}'s account has been ${status.toLowerCase()} successfully.`
        );

        onOpenChange(false);
    } else {
        showToast(
            "error",
            "Approval Failed",
            "Unable to update the account approval status. Please try again."
        );
    }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">

        {/* Header */}
        <div className="bg-orange-900 px-6 py-5">
          <DialogTitle className="text-left text-lg font-semibold text-white">
            Review account request
          </DialogTitle>
          <DialogDescription className="mt-1 text-orange-200">
            Review and approve or reject this account.
          </DialogDescription>
        </div>

        <div className="space-y-5 px-6 py-5">

          {/* Applicant */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <span className="text-sm font-semibold text-orange-800">
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-neutral-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{user.username}
              </p>
            </div>

            <span
              className={`ml-auto shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
            >
              {status}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">Email address</p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-orange-700" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">Requested role</p>
              <p className="mt-1 truncate text-sm font-medium text-orange-700">
                {user.role}
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="mt-1 truncate text-sm font-medium">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Decision */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-900">
              Approval decision
            </p>
            <p className="mt-1 text-xs text-orange-700">
              Select whether this account should be allowed access.
            </p>

            <div className="relative mt-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApprovalStatus)}
                className="w-full appearance-none rounded-lg border border-orange-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-800"
              >
                <option value="Approved">Approve account</option>
                <option value="Rejected">Reject account</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 border-t px-6 py-4 sm:justify-stretch">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 flex-1 rounded-lg border text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-900 text-sm font-medium text-white hover:bg-orange-800 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm decision
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}