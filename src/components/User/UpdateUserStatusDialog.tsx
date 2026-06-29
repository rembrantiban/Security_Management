import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import type { Users } from "@/store/useAuthStore";

type UpdateUserStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Users | null;
  loading?: boolean;
  onConfirm: () => void;
};

export default function UpdateUserStatusDialog({
  open,
  onOpenChange,
  user,
  loading = false,
  onConfirm,
}: UpdateUserStatusDialogProps) {
  if (!user) return null;

  const activate = !user.status;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-3xl overflow-hidden p-0">

        {/* Header */}

        <div
          className={`px-8 py-7 border-b ${
            activate
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              activate
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {activate ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-red-600" />
            )}
          </div>

          <h2 className="mt-2 text-center text-2xl font-bold text-slate-900">
            {activate
              ? "Activate User Account?"
              : "Deactivate User Account?"}
          </h2>

          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            {activate
              ? "This account will be able to sign in and access the Security Management System again."
              : "This account will no longer be able to sign in until it is activated again."}
          </p>
        </div>

        {/* Body */}

        <div className="px-8">


          {/* Status Preview */}

        
          {/* Warning */}

          <div
            className={` rounded-xl border p-4 ${
              activate
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-sm ${
                activate
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {activate ? (
                <>
                  <strong>Notice:</strong> This user will immediately regain
                  access to the Security Management System.
                </>
              ) : (
                <>
                  <strong>Warning:</strong> This user will immediately lose
                  access to the Security Management System until the account is
                  activated again.
                </>
              )}
            </p>
          </div>

        </div>

        {/* Footer */}

        <DialogFooter className="border-t bg-slate-50 px-8 py-5">

          <Button
            variant="outline"
            className="rounded-xl"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl ${
              activate
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : activate ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Activate User
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate User
              </>
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}