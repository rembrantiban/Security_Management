import { useEffect, useState } from "react";
import { UserX, ShieldAlert, Loader2 } from "lucide-react";
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

const emptyForm = { first_name: "", middle_name: "", last_name: "", reason: "" };

export default function AddBlacklistModal({
    open,
    onOpenChange,
    initialName,
}: AddBlacklistModalProps) {
    const { addToBlacklist, isLoading, error } = useBlacklist();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        ...emptyForm,
        first_name: initialName?.first_name ?? "",
        middle_name: initialName?.middle_name ?? "",
        last_name: initialName?.last_name ?? "",
    });

    const prefilled = Boolean(initialName?.first_name || initialName?.last_name);

    useEffect(() => {
        if (!open) return;

        setFormData({
            ...emptyForm,
            first_name: initialName?.first_name ?? "",
            middle_name: initialName?.middle_name ?? "",
            last_name: initialName?.last_name ?? "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialName?.first_name, initialName?.middle_name, initialName?.last_name]);

    const isValid =
        formData.first_name.trim().length > 0 &&
        formData.last_name.trim().length > 0 &&
        formData.reason.trim().length > 0;

    function resetForm() {
        setFormData({
            ...emptyForm,
            first_name: initialName?.first_name ?? "",
            middle_name: initialName?.middle_name ?? "",
            last_name: initialName?.last_name ?? "",
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
            <DialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl ring-1 ring-slate-200 sm:max-w-lg">

                {/* Header */}
                <DialogHeader className="gap-0 border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                            <UserX className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0">
                            <DialogTitle className="text-[15px] font-semibold tracking-tight text-slate-900">
                                Blacklist visitor
                            </DialogTitle>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                                This person will be blocked from registering for any
                                future campus visit.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="space-y-5 px-6 py-5">

                    <div>
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                            Visitor name
                        </p>

                        {prefilled ? (
                            <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200">
                                <p className="text-[13.5px] font-medium text-slate-900">
                                    {[formData.first_name, formData.middle_name, formData.last_name]
                                        .filter(Boolean)
                                        .join(" ")}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Pulled from the visitor record
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-2.5 sm:grid-cols-3">
                                <Field
                                    label="First name"
                                    value={formData.first_name}
                                    onChange={(v) => setFormData({ ...formData, first_name: v })}
                                    placeholder="First"
                                />
                                <Field
                                    label="Middle name"
                                    value={formData.middle_name}
                                    onChange={(v) => setFormData({ ...formData, middle_name: v })}
                                    placeholder="Optional"
                                />
                                <Field
                                    label="Last name"
                                    value={formData.last_name}
                                    onChange={(v) => setFormData({ ...formData, last_name: v })}
                                    placeholder="Last"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="blacklist-reason"
                            className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-slate-400"
                        >
                            Reason for blacklisting
                        </label>
                        <textarea
                            id="blacklist-reason"
                            rows={3}
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                            }
                            placeholder="e.g. Attempted unauthorized access, falsified ID, repeated policy violations…"
                            className="w-full resize-none rounded-xl bg-white px-3.5 py-3 text-[13px] text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-red-200"
                        />
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 ring-1 ring-amber-100">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <p className="text-[11.5px] leading-relaxed text-amber-800">
                            You can restore access at any time from the Visitor Blacklist
                            page.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="gap-2.5 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="h-9 gap-2 rounded-xl bg-red-600 px-4 text-[12.5px] font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-40"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Blacklisting…
                            </>
                        ) : (
                            <>
                                <UserX className="h-3.5 w-3.5" />
                                Blacklist visitor
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">
                {label}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-red-200"
            />
        </label>
    );
}
