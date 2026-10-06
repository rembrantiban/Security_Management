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
import { useSessionExpiryWatcher } from "@/hooks/useSessionExpiryWatcher";

// Must sit above every other overlay (e.g. AddUserDialog uses z-9999),
// otherwise the prompt opens hidden behind the active modal.
const SESSION_MODAL_LAYER = "z-[10000]";

export default function SessionExpiredModal() {
  const expired = useSessionStore((state) => state.expired);
  const setExpired = useSessionStore((state) => state.setExpired);
  const navigate = useNavigate();

  useSessionExpiryWatcher();

  const handleReturnToLogin = async () => {
    try {
      await useAuthStore.getState().logout();
    } catch {
      // session is already invalid server-side; ignore
    } finally {
      setExpired(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <AlertDialog open={expired}>
      <AlertDialogContent
        size="sm"
        className={SESSION_MODAL_LAYER}
        overlayClassName={SESSION_MODAL_LAYER}
      >
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
