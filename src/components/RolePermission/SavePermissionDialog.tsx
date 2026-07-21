import {
    Loader2,
    Save,
    ShieldCheck,
} from "lucide-react";

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

import { Badge } from "@/components/ui/badge";

import type { UserRole } from "./RoleSelector";

type SavePermissionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    role: UserRole;
    totalPermissions: number;

    loading?: boolean;

    onSave: () => void | Promise<void>;
};

export default function SavePermissionDialog({
    open,
    onOpenChange,
    role,
    totalPermissions,
    loading = false,
    onSave,
}: SavePermissionDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent className="max-w-md rounded-2xl">

                <AlertDialogHeader>

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                        <ShieldCheck className="h-8 w-8 text-orange-700" />
                    </div>

                    <AlertDialogTitle className="mt-4 text-center text-2xl">
                        Save Permission Changes?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-center text-slate-600">
                        These permission changes will immediately apply to
                        every user assigned to this role.
                    </AlertDialogDescription>

                </AlertDialogHeader>

                <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                            Role
                        </span>

                        <Badge variant="secondary">
                            {role}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                            Selected Permissions
                        </span>

                        <Badge className="bg-orange-700">
                            {totalPermissions}
                        </Badge>
                    </div>

                </div>

                <AlertDialogFooter>

                    <AlertDialogCancel
                        disabled={loading}
                    >
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onSave}
                        disabled={loading}
                        className="bg-orange-700 hover:bg-orange-800"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}