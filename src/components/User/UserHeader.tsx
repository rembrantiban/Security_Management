import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import AddUserDialog from "./AddUserDialog";

export default function UserHeader() {

  const [ open, setOpen ] = useState(false);
  return (
    <div className="flex flex-col gap-6 rounded border  border-gray-300 bg-linear-to-r from-orange-50 via-white to-orange-100 opacity-70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-orange-900 to-amber-600 text-orange-50 shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Users Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage administrators and authorized staff of the Security
              Management System.
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <Button
       onClick={() => setOpen(true)} 
        size="lg"
        className="rounded-xl bg-linear-to-r from-orange-900 to-orange-600 px-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add User
      </Button>

      <AddUserDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}