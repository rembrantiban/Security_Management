import { useEffect } from "react";
import {
    CheckCircle2,
    Clock,
    ExternalLink,
    ImageOff,
    LogIn,
    LogOut,
    Printer,
    X,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestAccess } from "@/store/useRequestStore";

type VisitorRequestDetailModalProps = {
    request: RequestAccess | null;
    onClose: () => void;
    onPrintPass: () => void;
    onRecordExit: () => void;
    isLoading: boolean;
};

const STATUS_STYLES: Record<RequestAccess["status"], string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-100",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Rejected: "bg-red-50 text-red-700 ring-red-100",
};

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const sectionLabel = "text-[10px] font-medium uppercase tracking-widest text-slate-400";

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

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

type TimelineStep = {
    key: string;
    title: string;
    detail: string;
    time?: string;
    icon: typeof Clock;
    tone: string;
    done: boolean;
};

/** Every recorded action on the request, in order, for traceability. */
function buildTimeline(r: RequestAccess): TimelineStep[] {
    const reviewed = r.status !== "Pending";

    return [
        {
            key: "registered",
            title: "Registered",
            detail: `By ${r.requested_by_name}`,
            time: r.created_at,
            icon: LogIn,
            tone: "bg-slate-900 text-white",
            done: true,
        },
        reviewed
            ? {
                  key: "reviewed",
                  title: r.status === "Approved" ? "Approved" : "Rejected",
                  detail: r.approved_by_name ? `By ${r.approved_by_name}` : "By an administrator",
                  time: r.approved_at ?? undefined,
                  icon: r.status === "Approved" ? CheckCircle2 : XCircle,
                  tone: r.status === "Approved" ? "bg-emerald-600 text-white" : "bg-red-600 text-white",
                  done: true,
              }
            : {
                  key: "reviewed",
                  title: "Administrator review",
                  detail: "Awaiting approval",
                  icon: Clock,
                  tone: "bg-white text-amber-600 ring-1 ring-amber-200",
                  done: false,
              },
        ...(r.status === "Rejected"
            ? []
            : [
                  r.checked_out_at
                      ? {
                            key: "exit",
                            title: "Exited campus",
                            detail: "Exit recorded at the gate",
                            time: r.checked_out_at,
                            icon: LogOut,
                            tone: "bg-slate-900 text-white",
                            done: true,
                        }
                      : {
                            key: "exit",
                            title: "Exit",
                            detail: r.status === "Approved" ? "Visitor is on campus" : "Pending approval",
                            icon: LogOut,
                            tone: "bg-white text-slate-400 ring-1 ring-slate-200",
                            done: false,
                        },
              ]),
    ];
}

export default function VisitorRequestDetailModal({
    request,
    onClose,
    onPrintPass,
    onRecordExit,
    isLoading,
}: VisitorRequestDetailModalProps) {
    useEffect(() => {
        if (!request) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [request, onClose]);

    if (!request) return null;

    const name = fullName(request);
    const timeline = buildTimeline(request);
    const onCampus = request.status === "Approved" && !request.checked_out_at;

    return (
        // Plain overlay rather than the Dialog primitive (backdrop-blur fix).
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="visitor-request-title"
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            >
                {/* Header */}
                <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-800 text-[13px] font-semibold text-amber-50">
                        {getInitials(name)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-orange-700">
                            Visitor request
                        </p>
                        <h2
                            id="visitor-request-title"
                            className="mt-0.5 truncate text-[15px] font-semibold tracking-tight text-slate-900"
                        >
                            {name}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[11px] tracking-tight text-slate-500">
                                {request.request_number}
                            </span>
                            <span className={`${chip} ${STATUS_STYLES[request.status]}`}>
                                {request.status}
                            </span>
                            {onCampus && (
                                <span className={`${chip} bg-blue-50 text-blue-700 ring-blue-100`}>
                                    On campus
                                </span>
                            )}
                            {request.checked_out_at && (
                                <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                                    Exited
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="-mr-1 h-7 w-7 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="space-y-5 overflow-y-auto px-5 py-4">
                    {/* Visit details */}
                    <section>
                        <p className={sectionLabel}>Visit details</p>
                        <dl className="mt-2 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
                            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-3.5 py-2.5">
                                <dt className="text-[12px] text-slate-500">Purpose</dt>
                                <dd className="text-[12.5px] leading-relaxed text-slate-800">
                                    {request.purpose}
                                </dd>
                            </div>
                            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-3.5 py-2.5">
                                <dt className="text-[12px] text-slate-500">ID presented</dt>
                                <dd className="text-[12.5px] text-slate-800">
                                    {request.id_type ?? "Not specified"}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* ID verification */}
                    <section>
                        <div className="flex items-center justify-between">
                            <p className={sectionLabel}>ID verification</p>
                            {request.id_image && (
                                <a
                                    href={request.id_image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
                                >
                                    Open full size
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>

                        <div className="mt-2 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                            {request.id_image ? (
                                <img
                                    src={request.id_image}
                                    alt={`${request.id_type ?? "ID"} presented by ${name}`}
                                    className="max-h-48 w-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-1.5 py-7 text-center">
                                    <ImageOff className="h-4 w-4 text-slate-300" />
                                    <p className="text-[11.5px] text-slate-400">No ID image uploaded</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Activity timeline */}
                    <section>
                        <p className={sectionLabel}>Activity</p>
                        <ol className="mt-3">
                            {timeline.map((step, index) => {
                                const Icon = step.icon;
                                const isLast = index === timeline.length - 1;
                                return (
                                    <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
                                        {!isLast && (
                                            <span
                                                className={`absolute left-[11px] top-6 bottom-0 w-px ${
                                                    step.done ? "bg-slate-300" : "border-l border-dashed border-slate-200"
                                                }`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span
                                            className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.tone}`}
                                        >
                                            <Icon className="h-3 w-3" />
                                        </span>
                                        <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pt-0.5">
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-[12.5px] font-medium ${
                                                        step.done ? "text-slate-900" : "text-slate-500"
                                                    }`}
                                                >
                                                    {step.title}
                                                </p>
                                                <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                                                    {step.detail}
                                                </p>
                                            </div>
                                            {step.time && (
                                                <time
                                                    dateTime={step.time}
                                                    className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-slate-400"
                                                >
                                                    {formatDateTime(step.time)}
                                                </time>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                    {request.status === "Approved" ? (
                        <>
                            <p className="hidden text-[11px] text-slate-500 sm:block">
                                {request.checked_out_at
                                    ? "Visit complete."
                                    : "Record the exit when the visitor leaves."}
                            </p>
                            <div className="flex w-full justify-end gap-2 sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={onPrintPass}
                                    className="h-9 gap-1.5 rounded-lg border-slate-200 px-3.5 text-[12.5px] text-slate-700 shadow-none hover:bg-white"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    Print pass
                                </Button>
                                <Button
                                    onClick={onRecordExit}
                                    disabled={isLoading || !!request.checked_out_at}
                                    className="h-9 gap-1.5 rounded-lg bg-stone-900 px-3.5 text-[12.5px] font-medium text-white shadow-none hover:bg-stone-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    {request.checked_out_at ? "Exit recorded" : "Record exit"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="flex items-center gap-2 text-[11.5px] text-slate-500">
                                {request.status === "Pending" ? (
                                    <>
                                        <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                        Awaiting administrator review. The pass is available once approved.
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                                        This request was rejected. No gate pass can be issued.
                                    </>
                                )}
                            </p>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="h-9 shrink-0 rounded-lg border-slate-200 px-3.5 text-[12.5px] text-slate-700 shadow-none hover:bg-white"
                            >
                                Close
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
