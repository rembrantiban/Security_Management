import { createPortal } from "react-dom";
import { Printer, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RequestAccess } from "@/store/useRequestStore";

type VisitorPassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: RequestAccess | null;
};

function fullName(r: RequestAccess) {
    return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function PassCard({
    request,
    size = "sm",
}: {
    request: RequestAccess;
    size?: "sm" | "lg";
}) {
    const isLarge = size === "lg";

    return (
        <div
            className={`overflow-hidden border border-orange-200 bg-white shadow-sm ${
                isLarge ? "rounded-3xl" : "rounded-2xl"
            }`}
        >
            {/* Pass header */}
            <div
                className={`flex items-center bg-linear-to-r from-orange-700 to-amber-700 text-white ${
                    isLarge ? "gap-4 px-8 py-6" : "gap-2.5 px-4 py-3"
                }`}
            >
                <img
                    src="/sfc.png"
                    alt="Logo"
                    className={isLarge ? "h-12 w-12 object-contain" : "h-7 w-7 object-contain"}
                />
                <div>
                    <p
                        className={`font-semibold uppercase tracking-widest text-orange-100 ${
                            isLarge ? "text-sm" : "text-[11px]"
                        }`}
                    >
                        St Francis College
                    </p>
                    <p className={`font-bold leading-none ${isLarge ? "text-2xl" : "text-sm"}`}>
                        Visitor Pass
                    </p>
                </div>
            </div>

            <div
                className={`flex flex-col items-center text-center ${
                    isLarge ? "px-10 py-10" : "px-5 py-5"
                }`}
            >
                <div
                    className={`flex items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 ${
                        isLarge ? "h-28 w-28 text-4xl" : "h-16 w-16 text-lg"
                    }`}
                >
                    {getInitials(fullName(request))}
                </div>

                <p className={`mt-4 font-semibold text-slate-900 ${isLarge ? "text-3xl" : "text-base"}`}>
                    {fullName(request)}
                </p>
                <p className={`mt-1 text-slate-400 ${isLarge ? "text-base" : "text-xs"}`}>
                    {request.request_number}
                </p>

                <div
                    className={`mt-6 w-full space-y-3 rounded-xl bg-slate-50/80 text-left ${
                        isLarge ? "p-6 text-base" : "p-3 text-xs"
                    }`}
                >
                    <Row label="Purpose" value={request.purpose} />
                    <Row label="ID Presented" value={request.id_type ?? "—"} />
                    <Row
                        label="Approved By"
                        value={request.approved_by_name ?? "—"}
                    />
                    <Row
                        label="Date Issued"
                        value={formatDate(request.approved_at ?? request.created_at)}
                    />
                </div>

                <div
                    className={`mt-6 flex items-center gap-2 font-medium text-emerald-600 ${
                        isLarge ? "text-base" : "text-[11px]"
                    }`}
                >
                    <ShieldCheck className={isLarge ? "h-5 w-5" : "h-3.5 w-3.5"} />
                    Identity Verified &amp; Approved
                </div>

                <p
                    className={`mt-4 leading-relaxed text-slate-400 ${
                        isLarge ? "text-sm" : "text-[10px]"
                    }`}
                >
                    Please wear this pass visibly and present it at all
                    checkpoints. Return it to the guard house upon exit.
                </p>
            </div>
        </div>
    );
}

export default function VisitorPassModal({
    open,
    onOpenChange,
    request,
}: VisitorPassModalProps) {
    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm rounded-2xl p-0 gap-0 overflow-hidden border border-gray-200">
                <DialogHeader className="px-5 pt-5 pb-2">
                    <DialogTitle className="text-sm font-semibold text-gray-800">
                        Visitor Pass
                    </DialogTitle>
                </DialogHeader>

                <div className="px-5 pb-5">
                    <PassCard request={request} />
                </div>

                <DialogFooter className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 flex sm:justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-linear-to-r from-orange-700 to-amber-700 text-white shadow-sm shadow-orange-900/30 hover:brightness-105 gap-2"
                    >
                        <Printer size={15} />
                        Print Pass
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/*
                The dialog itself is centered with a CSS transform and clips its
                overflow, which turns it into a containing/clipping box for any
                `position: fixed` element inside it. Printing directly from inside
                the dialog cuts the pass off. Instead, render a second copy
                straight onto <body> (outside the dialog's DOM subtree) and hide
                everything else while printing.
            */}
            {open &&
                createPortal(
                    <>
                        <style>{`
                            #visitor-pass-print-root { display: none; }
                            @media print {
                                body > *:not(#visitor-pass-print-root) {
                                    display: none !important;
                                }
                                #visitor-pass-print-root {
                                    display: flex !important;
                                    justify-content: center;
                                    padding: 24px;
                                }
                            }
                        `}</style>
                        <div id="visitor-pass-print-root">
                            <div className="w-full max-w-xl">
                                <PassCard request={request} size="lg" />
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </Dialog>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 font-medium text-slate-400">{label}</span>
            <span className="text-right text-slate-700">{value}</span>
        </div>
    );
}
