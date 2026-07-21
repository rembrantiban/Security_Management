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
    TriangleAlert,
    XCircle,
    User,
    BadgeCheck,
} from "lucide-react";

type RejectRequestDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requestNumber?: string;
    visitorName?: string;
    isLoading?: boolean;
    onConfirm: () => void;
};

export default function RejectRequestDialog({
    open,
    onOpenChange,
    requestNumber,
    visitorName,
    isLoading = false,
    onConfirm,
}: RejectRequestDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent className="max-w-lg overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">

                {/* Header */}
                <div className="relative overflow-hidden border-b border-red-100 bg-linear-to-r from-red-50 via-white to-red-50 px-7 py-6">

                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-200/20 blur-3xl" />

                    <div className="relative flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 shadow-inner">
                            <TriangleAlert className="h-7 w-7 text-red-600" />
                        </div>

                        <div>

                            <AlertDialogTitle className="text-xl font-bold text-slate-900">
                                Reject Visitor Request
                            </AlertDialogTitle>

                            <p className="mt-1 text-sm text-slate-500">
                                Confirm before denying this visitor access request.
                            </p>

                        </div>

                    </div>

                </div>

                <AlertDialogHeader className="space-y-0 px-7 pt-6 pb-0">

                    {/* Visitor Card */}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                                <User className="h-5 w-5 text-orange-700" />
                            </div>

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Visitor
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {visitorName}
                                </p>

                                {requestNumber && (
                                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                        <BadgeCheck className="h-3.5 w-3.5" />
                                        {requestNumber}
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* Description */}

                    <AlertDialogDescription className="pt-5 text-sm leading-7 text-slate-600">

                        You are about to reject this visitor access request.

                        Once rejected, the visitor will no longer be allowed to
                        enter the campus under this request and must submit a
                        new request for future access.

                    </AlertDialogDescription>

                    {/* Warning */}
                </AlertDialogHeader>

                {/* Footer */}

                <AlertDialogFooter className="mt-7 border-t bg-slate-50 px-7 py-5">

                    <AlertDialogCancel
                        disabled={isLoading}
                        className="rounded-xl px-6"
                    >
                        Keep Request
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={isLoading}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="rounded-xl bg-red-600 px-6 hover:bg-red-700"
                    >
                        <XCircle className="mr-2 h-4 w-4" />

                        {isLoading
                            ? "Rejecting..."
                            : "Reject Request"}
                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}