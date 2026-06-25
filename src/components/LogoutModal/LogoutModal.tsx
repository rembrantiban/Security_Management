import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { LogOut, ShieldAlert } from "lucide-react";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};


export default function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl border-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-600 to-orange-800 px-6 py-8 text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <LogOut className="h-8 w-8" />
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-2xl font-bold">
              Sign Out
            </h2>

            <p className="mt-2 text-sm text-orange-100">
              End your current session securely.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
              Are you sure you want to logout?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-slate-600">
              You will be signed out of your account and redirected to the
              login page. Any unsaved changes may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="h-11 rounded-xl border-slate-300">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirm}
              className="h-11 rounded-xl bg-orange-600 hover:bg-orange-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}