import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import AddUserDialog from "./AddUserDialog";

export default function UserHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

      {/* Ambient wash */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

      <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <ShieldCheck className="h-5 w-5 text-amber-100" />
          </div>

          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold tracking-tight text-white">
              Users Management
            </h1>
            <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-amber-100/70">
              Manage administrators and authorized staff of the Security
              Management System.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add user
        </Button>

      </div>

      <AddUserDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}