import { useEffect, useState } from "react";
import { UserX, User, MessageSquareWarning, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBlacklist } from "@/hooks/useBlacklist";
import { useToast } from "@/hooks/useToast";

type AddBlacklistModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName?: {
        first_name: string;
        middle_name?: string | null;
        last_name: string;
    };
};

export default function AddBlacklistModal({
    open,
    onOpenChange,
    initialName,
}: AddBlacklistModalProps) {
    const { addToBlacklist, isLoading, error } = useBlacklist();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        first_name: initialName?.first_name ?? "",
        middle_name: initialName?.middle_name ?? "",
        last_name: initialName?.last_name ?? "",
        reason: "",
    });

    useEffect(() => {
        if (!open) return;

        setFormData({
            first_name: initialName?.first_name ?? "",
            middle_name: initialName?.middle_name ?? "",
            last_name: initialName?.last_name ?? "",
            reason: "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialName?.first_name, initialName?.middle_name, initialName?.last_name]);

    const isValid =
        formData.first_name.trim().length > 0 &&
        formData.last_name.trim().length > 0 &&
        formData.reason.trim().length > 0;

    function resetForm() {
        setFormData({
            first_name: initialName?.first_name ?? "",
            middle_name: initialName?.middle_name ?? "",
            last_name: initialName?.last_name ?? "",
            reason: "",
        });
    }

    function handleClose() {
        onOpenChange(false);
        setTimeout(resetForm, 200);
    }

    const handleSubmit = async () => {
        if (!isValid) return;

        const success = await addToBlacklist({
            first_name: formData.first_name.trim(),
            middle_name: formData.middle_name.trim() || undefined,
            last_name: formData.last_name.trim(),
            reason: formData.reason.trim(),
        });

        if (success) {
            showToast(
                "success",
                "Visitor Blacklisted",
                `${formData.first_name} ${formData.last_name} has been added to the blacklist.`
            );
            handleClose();
        } else {
            showToast(
                "error",
                "Action Failed",
                error || "Unable to blacklist this visitor."
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md rounded p-0 gap-0 overflow-hidden border border-gray-200">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 shrink-0">
                            <UserX size={18} />
                        </span>
                        <div>
                            <DialogTitle className="text-base font-semibold text-gray-800">
                                Blacklist Visitor
                            </DialogTitle>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Prevent this individual from registering for future visits.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <FieldShell label="First Name" icon={<User size={15} />}>
                            <input
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, first_name: e.target.value })
                                }
                                placeholder="First name"
                                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                            />
                        </FieldShell>
                        <FieldShell label="Middle Name">
                            <input
                                value={formData.middle_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, middle_name: e.target.value })
                                }
                                placeholder="Optional"
                                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                            />
                        </FieldShell>
                        <FieldShell label="Last Name">
                            <input
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
                                }
                                placeholder="Last name"
                                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                            />
                        </FieldShell>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                            <MessageSquareWarning size={13} />
                            Reason for Blacklisting
                        </label>
                        <textarea
                            rows={3}
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                            }
                            placeholder="e.g. Attempted unauthorized access, falsified ID, repeated policy violations..."
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none resize-none placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-300 bg-gray-50/60 flex sm:justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="rounded-xl bg-red-600 text-white shadow-sm shadow-red-900/20 hover:bg-red-700 disabled:opacity-40 gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Blacklisting...
                            </>
                        ) : (
                            <>
                                <UserX size={15} />
                                Blacklist Visitor
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FieldShell({
    label,
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-colors">
                {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
                {children}
            </div>
        </div>
    );
}
