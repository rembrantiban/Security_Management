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

import {
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

type ApproveRequestDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requestNumber?: string;
    visitorName?: string;
    isLoading?: boolean;
    onConfirm: () => void;
};

export default function ApproveRequestDialog({
    open,
    onOpenChange,
    requestNumber,
    visitorName,
    isLoading,
    onConfirm,
}: ApproveRequestDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent className="max-w-md overflow-hidden rounded-3xl border-0 p-0">

                {/* Header */}

                <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">

                            <ShieldCheck className="h-7 w-7 text-emerald-600" />

                        </div>

                        <div>

                            <AlertDialogTitle className="text-xl font-bold text-slate-900">

                                Approve Visitor Request?

                            </AlertDialogTitle>

                            <p className="mt-1 text-sm text-slate-500">
                                The visitor will be granted access approval.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Body */}

                <AlertDialogHeader className="px-6 pt-6 pb-2">

                    <AlertDialogDescription className="text-sm leading-6 text-slate-600">

                        Are you sure you want to approve the visitor request for{" "}

                        <span className="font-semibold text-slate-900">
                            {visitorName}
                        </span>

                        {requestNumber && (
                            <>
                                {" "}(
                                <span className="font-medium text-emerald-700">
                                    {requestNumber}
                                </span>
                                )
                            </>
                        )}

                        ?

                        <br />
                        <br />

                        Once approved, the visitor will be authorized to enter the campus during the scheduled visit.

                    </AlertDialogDescription>

                </AlertDialogHeader>

                {/* Footer */}

                <AlertDialogFooter className="border-t bg-slate-50 px-6 py-4">

                    <AlertDialogCancel className="rounded-xl">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />

                        {isLoading
                            ? "Approving..."
                            : "Approve Request"}

                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}