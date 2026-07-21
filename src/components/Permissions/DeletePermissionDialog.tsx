import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    Loader2,
    ShieldAlert,
    Trash2,
} from "lucide-react";

import {
    usePermissionStore,
    type Permission,
} from "@/store/usePermissionsStore";

type DeletePermissionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission | null;
};

export default function DeletePermissionDialog({
    open,
    onOpenChange,
    permission,
}: DeletePermissionDialogProps) {
    const {
        deletePermission,
        isLoading,
    } = usePermissionStore();

    const handleDelete = async () => {
        if (!permission) return;

        const success = await deletePermission(
            permission.permission_id
        );

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md overflow-hidden rounded-xl p-0">

                {/* Header */}

                <div className="bg-red-800 px-6 py-8 text-white">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                        <Trash2 className="h-8 w-8" />
                    </div>

                    <DialogHeader className="mt-5">

                        <DialogTitle className="text-center text-2xl font-bold text-white">
                            Delete Permission
                        </DialogTitle>

                        <DialogDescription className="text-center text-red-100">
                            This action cannot be undone.
                        </DialogDescription>

                    </DialogHeader>

                </div>

                {/* Body */}

                <div className="space-y-5 p-6">

                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />

                        <div>

                            <h4 className="font-semibold text-red-900">
                                Are you sure?
                            </h4>

                            <p className="mt-1 text-sm text-red-700">
                                You are about to permanently delete the
                                permission
                                <span className="font-semibold">
                                    {" "}
                                    "{permission?.permission_name}"
                                </span>
                                .
                            </p>

                            <div className="mt-4 rounded-lg border border-red-200 bg-white p-3 text-sm">

                                <div className="flex justify-between">

                                    <span className="text-slate-500">
                                        Module
                                    </span>

                                    <span className="font-medium">
                                        {permission?.module_name}
                                    </span>

                                </div>

                                <div className="mt-2 flex justify-between">

                                    <span className="text-slate-500">
                                        Permission
                                    </span>

                                    <span className="font-medium">
                                        {permission?.permission_name}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <DialogFooter className="border-t bg-slate-50 px-6 py-4">

                    <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        disabled={isLoading}
                        onClick={handleDelete}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permission
                            </>
                        )}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}