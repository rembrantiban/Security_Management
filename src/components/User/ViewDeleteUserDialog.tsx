import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import type { Users } from "@/store/useAuthStore";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Users | null;
  loading?: boolean;
  onConfirm: () => Promise<void>;
};

export default function ViewDeleteUserDialog({
  open,
  onOpenChange,
  user,
  loading = false,
  onConfirm,
}: DeleteUserDialogProps) {
  if (!user) return null;


  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-8 py-7">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
            Delete User Account?
          </h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            This action cannot be undone. The selected account will be
            permanently removed from the Security Management System.
          </p>

        </div>

        {/* User Card */}

        <div className="px-2 ">

          <div className=" rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm text-red-700">
              <strong>Warning:</strong> Deleting this account will permanently
              remove the user's information. This action cannot be reversed.
            </p>

          </div>

        </div>

        {/* Footer */}

        <DialogFooter className="gap-3 border-t bg-slate-50 px-8 py-5">

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
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}