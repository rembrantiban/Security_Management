import { ShieldAlert, ShieldCheck } from "lucide-react";

import ConfirmActionDialog, {
  ConfirmTargetUser,
} from "@/components/Modal/ConfirmActionDialog";
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
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      loading={loading}
      onConfirm={onConfirm}
      tone={activate ? "success" : "danger"}
      icon={activate ? ShieldCheck : ShieldAlert}
      title={activate ? "Activate account?" : "Deactivate account?"}
      description={
        activate
          ? "This user will be able to sign in to the system again."
          : "This user will no longer be able to sign in until the account is reactivated."
      }
      confirmLabel={activate ? "Activate" : "Deactivate"}
      loadingLabel="Updating..."
    >
      <ConfirmTargetUser
        name={`${user.first_name} ${user.last_name}`}
        email={user.email}
      />
    </ConfirmActionDialog>
  );
}
