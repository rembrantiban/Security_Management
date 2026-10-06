import { Trash2 } from "lucide-react";

import ConfirmActionDialog, {
  ConfirmTargetUser,
} from "@/components/Modal/ConfirmActionDialog";
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
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      loading={loading}
      onConfirm={onConfirm}
      tone="danger"
      icon={Trash2}
      title="Delete account?"
      description="This will permanently remove the user from the system. This action cannot be undone."
      confirmLabel="Delete"
      loadingLabel="Deleting..."
    >
      <ConfirmTargetUser
        name={`${user.first_name} ${user.last_name}`}
        email={user.email}
      />
    </ConfirmActionDialog>
  );
}
