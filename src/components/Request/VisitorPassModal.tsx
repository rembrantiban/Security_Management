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
        day: "2-digit",
        year: "numeric",
    });
}

/** Deterministic bar pattern so the same pass always renders the same "barcode". */
function barPattern(seed: string) {
    const bars: number[] = [];
    for (let i = 0; i < 48; i++) {
        const c = seed.charCodeAt(i % seed.length) + i * 13;
        bars.push((c % 3) + 1);
    }
    return bars;
}

const SIZES = {
    sm: {
        band: "w-6",
        bandText: "text-[9px] tracking-[0.25em]",
        content: "pl-6",
        headPad: "px-4 py-2.5",
        logo: "h-9 w-9",
        school: "text-[12px]",
        sub: "text-[8px] tracking-[0.16em]",
        official: "text-[8px]",
        passLabel: "text-[15px]",
        bodyPad: "px-4 py-3.5",
        photo: "h-24 w-[74px]",
        photoText: "text-lg",
        nameLabel: "text-[8px] tracking-[0.18em]",
        name: "text-[15px]",
        grid: "gap-x-3 gap-y-1.5 text-[10px]",
        fieldLabel: "text-[7.5px] tracking-[0.16em]",
        verified: "text-[9px]",
        verifiedIcon: "h-3 w-3",
        footPad: "px-4 py-2.5",
        barcode: "h-7",
        barUnit: 1,
        barCode: "text-[8px] tracking-[0.2em]",
        sig: "h-7 w-28",
        sigLabel: "text-[7.5px] tracking-[0.16em]",
        strip: "px-4 py-1 text-[7px] tracking-[0.18em]",
        watermark: "h-24 w-24",
    },
    lg: {
        band: "w-10",
        bandText: "text-sm tracking-[0.4em]",
        content: "pl-10",
        headPad: "px-8 py-5",
        logo: "h-16 w-16",
        school: "text-xl",
        sub: "text-[11px] tracking-[0.22em]",
        official: "text-[11px]",
        passLabel: "text-[26px]",
        bodyPad: "px-8 py-6",
        photo: "h-44 w-36",
        photoText: "text-4xl",
        nameLabel: "text-[11px] tracking-[0.22em]",
        name: "text-[32px]",
        grid: "gap-x-8 gap-y-3 text-[15px]",
        fieldLabel: "text-[10px] tracking-[0.2em]",
        verified: "text-sm",
        verifiedIcon: "h-4 w-4",
        footPad: "px-8 py-5",
        barcode: "h-14",
        barUnit: 2,
        barCode: "text-[11px] tracking-[0.3em]",
        sig: "h-12 w-60",
        sigLabel: "text-[10px] tracking-[0.2em]",
        strip: "px-8 py-2 text-[10px] tracking-[0.22em]",
        watermark: "h-52 w-52",
    },
} as const;

function PassCard({
    request,
    size = "sm",
}: {
    request: RequestAccess;
    size?: "sm" | "lg";
}) {
    const s = SIZES[size];
    const name = fullName(request);
    const issued = formatDate(request.approved_at ?? request.created_at);
    const bars = barPattern(request.request_number);
    const isApproved = request.status === "Approved";
    const approverName = request.approved_by_name ?? "Admin";

    return (
        <div className="relative overflow-hidden rounded-sm border border-slate-300 bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.25)] print:shadow-none">

            {/* Security side band */}
            <div className={`absolute inset-y-0 left-0 ${s.band} flex items-center justify-center bg-red-700`}>
                <span
                    className={`font-bold uppercase text-white [writing-mode:vertical-rl] rotate-180 ${s.bandText}`}
                >
                    Visitor Pass
                </span>
            </div>

            {/* Watermark */}
            <ShieldCheck
                className={`pointer-events-none absolute -bottom-4 right-1 ${s.watermark} text-slate-900/4`}
                strokeWidth={1.25}
            />

            <div className={`relative ${s.content}`}>

                {/* Header */}
                <div className={`flex items-center gap-3 border-b-2 border-slate-900 ${s.headPad}`}>
                    <img
                        src="/sfc.png"
                        alt="St. Francis College"
                        className={`${s.logo} shrink-0 object-contain`}
                    />

                    <div className="min-w-0 flex-1">
                        <p className={`font-bold uppercase leading-tight text-slate-900 ${s.school}`}>
                            St. Francis College
                        </p>
                        <p className={`font-medium uppercase text-slate-500 ${s.sub}`}>
                            Guihulngan City &middot; Security Office
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className={`font-semibold uppercase text-red-700 ${s.official}`}>
                            Official
                        </p>
                        <p className={`font-extrabold uppercase leading-none tracking-tight text-slate-900 ${s.passLabel}`}>
                            Gate Pass
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className={`flex gap-4 ${s.bodyPad}`}>

                    {/* Photo */}
                    <div className={`${s.photo} shrink-0 overflow-hidden rounded-sm border border-slate-300 bg-slate-100`}>
                        {request.id_image ? (
                            <img
                                src={request.id_image}
                                alt="Visitor"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className={`flex h-full w-full items-center justify-center font-bold text-slate-400 ${s.photoText}`}>
                                {getInitials(name)}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                        <p className={`font-semibold uppercase text-slate-400 ${s.nameLabel}`}>
                            Visitor Name
                        </p>
                        <p className={`truncate font-bold leading-tight text-slate-900 ${s.name}`}>
                            {name}
                        </p>

                        <div className={`mt-3 grid grid-cols-2 ${s.grid}`}>
                            <Field
                                sizeCls={s.fieldLabel}
                                label="Pass No."
                                value={request.request_number}
                                mono
                            />
                            <Field
                                sizeCls={s.fieldLabel}
                                label="Date Issued"
                                value={issued}
                            />
                            <Field
                                sizeCls={s.fieldLabel}
                                label="Purpose"
                                value={request.purpose}
                                span2
                            />
                            <Field
                                sizeCls={s.fieldLabel}
                                label="ID Presented"
                                value={request.id_type ?? "—"}
                            />
                            <Field
                                sizeCls={s.fieldLabel}
                                label="Validity"
                                value="Single-entry, day pass"
                            />
                        </div>

                        <div className={`mt-3 flex items-center gap-1.5 font-semibold text-emerald-600 ${s.verified}`}>
                            <ShieldCheck className={s.verifiedIcon} />
                            Identity verified &amp; approved
                        </div>
                    </div>
                </div>

                {/* Footer — barcode + signature */}
                <div className={`flex items-end justify-between gap-6 border-t border-dashed border-slate-300 ${s.footPad}`}>
                    <div className="min-w-0">
                        <div className={`flex items-end gap-px ${s.barcode}`}>
                            {bars.map((w, i) => (
                                <div
                                    key={i}
                                    style={{ width: `${w * s.barUnit}px` }}
                                    className={`h-full ${i % 2 === 0 ? "bg-slate-900" : "bg-transparent"}`}
                                />
                            ))}
                        </div>
                        <p className={`mt-1 font-mono uppercase text-slate-500 ${s.barCode}`}>
                            {request.request_number}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <div className={`${s.sig} ml-auto border-b border-slate-400`} />
                        <p className={`mt-1 font-medium uppercase text-slate-400 ${s.sigLabel}`}>
                            {request.approved_by_name ?? "Authorized signature"}
                        </p>
                    </div>
                </div>

                {/* Bottom security strip */}
                <div className={`bg-slate-900 text-center ${s.strip}`}>
                    {isApproved && (
                        <p className="mb-1 flex items-center justify-center gap-1.5 font-bold uppercase text-emerald-400">
                            <ShieldCheck className={s.verifiedIcon} />
                            Approved &middot; {approverName}
                        </p>
                    )}
                    <p className="font-medium uppercase text-slate-300">
                        Wear visibly &middot; Non-transferable &middot; Surrender at guard house on exit
                    </p>
                </div>
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
            <DialogContent className="sm:max-w-xl rounded-lg p-0 gap-0 overflow-hidden border border-slate-200">
                <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
                    <DialogTitle className="text-sm font-semibold text-slate-800">
                        Visitor Gate Pass
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-slate-50 px-5 py-6">
                    <PassCard request={request} />
                </div>

                <DialogFooter className="px-5 py-4 border-t border-slate-100 bg-white flex sm:justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-md border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-md bg-slate-900 text-white shadow-sm hover:bg-slate-800 gap-2"
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
                                    align-items: flex-start;
                                    padding: 32px;
                                }
                            }
                        `}</style>
                        <div id="visitor-pass-print-root">
                            <div className="w-full max-w-2xl">
                                <PassCard request={request} size="lg" />
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </Dialog>
    );
}

function Field({
    label,
    value,
    mono,
    span2,
    sizeCls,
}: {
    label: string;
    value: string;
    mono?: boolean;
    span2?: boolean;
    sizeCls: string;
}) {
    return (
        <div className={span2 ? "col-span-2" : ""}>
            <p className={`font-semibold uppercase text-slate-400 ${sizeCls}`}>
                {label}
            </p>
            <p
                className={`mt-0.5 font-medium text-slate-800 ${
                    mono ? "font-mono tracking-tight" : ""
                } ${span2 ? "truncate" : ""}`}
            >
                {value}
            </p>
        </div>
    );
}
