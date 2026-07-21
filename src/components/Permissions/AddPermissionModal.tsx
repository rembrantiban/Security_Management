import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    ShieldCheck,
    FolderKanban,
    KeyRound,
    Loader2,
} from "lucide-react";

import { usePermissionStore } from "@/store/usePermissionsStore";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function AddPermissionModal({
    open,
    onOpenChange,
}: Props) {
    const { createPermission, isLoading } =
        usePermissionStore();

    const [moduleName, setModuleName] =
        useState("");

    const [permissionName, setPermissionName] =
        useState("");

    const isValid =
        moduleName.trim() !== "" &&
        permissionName.trim() !== "";

    function resetForm() {
        setModuleName("");
        setPermissionName("");
    }

    function handleClose() {
        onOpenChange(false);

        setTimeout(resetForm, 200);
    }

    const handleSubmit = async () => {
        if (!isValid) return;

        const success =
            await createPermission({
                module_name: moduleName,
                permission_name: permissionName,
            });

        if (success) {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent className="sm:max-w-lg rounded-xl overflow-hidden p-0">

                {/* Header */}

                <DialogHeader className="border-b bg-orange-50 px-6 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">

                            <ShieldCheck className="h-5 w-5 text-orange-700" />

                        </div>

                        <div>

                            <DialogTitle className="text-lg">
                                Add Permission
                            </DialogTitle>

                            <p className="text-sm text-slate-500">
                                Create a new permission that can
                                later be assigned to system roles.
                            </p>

                        </div>

                    </div>

                </DialogHeader>

                {/* Body */}

                <div className="space-y-5 p-6">

                    {/* Module */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Module Name
                        </label>

                        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">

                            <FolderKanban className="h-4 w-4 text-slate-400" />

                            <input
                                value={moduleName}
                                onChange={(e) =>
                                    setModuleName(
                                        e.target.value
                                    )
                                }
                                placeholder="Incident Management"
                                className="w-full bg-transparent outline-none"
                            />

                        </div>

                    </div>

                    {/* Permission */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Permission Name
                        </label>

                        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">

                            <KeyRound className="h-4 w-4 text-slate-400" />

                            <input
                                value={permissionName}
                                onChange={(e) =>
                                    setPermissionName(
                                        e.target.value
                                    )
                                }
                                placeholder="Create Incident"
                                className="w-full bg-transparent outline-none"
                            />

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <DialogFooter className="border-t bg-slate-50 px-6 py-4">

                    <Button
                        variant="outline"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={
                            !isValid || isLoading
                        }
                        className="bg-orange-700 hover:bg-orange-800"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Create Permission
                            </>
                        )}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}