import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddUserDialog from "./AddUserDialog";
import PageHeader, { HEADER_PRIMARY_BUTTON } from "@/components/layout/PageHeader";

export default function UserHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="User management"
        title="Users"
        description="Manage administrators and authorized staff of the Security Management System."
        actions={
          <Button onClick={() => setOpen(true)} className={HEADER_PRIMARY_BUTTON}>
            <Plus className="h-3.5 w-3.5" />
            Add user
          </Button>
        }
      />

      <AddUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
