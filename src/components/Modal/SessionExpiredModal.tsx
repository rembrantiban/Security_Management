import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function SessionExpiredModal() {
  const expired = useSessionStore((state) => state.expired);
  const setExpired = useSessionStore((state) => state.setExpired);
  const navigate = useNavigate();

  const handleReturnToLogin = async () => {
    try {
      await useAuthStore.getState().logout();
    } catch {
      // session is already invalid server-side; ignore
    } finally {
      setExpired(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <AlertDialog open={expired}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <LockKeyhole />
          </AlertDialogMedia>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has ended for security reasons. Please log in
            again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center items-center">
          <AlertDialogAction onClick={handleReturnToLogin} className="w-67.5 bg-rose-600 hover:bg-rose-700">
            Log In Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
