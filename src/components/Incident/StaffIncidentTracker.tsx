import {
    Calendar,
    CircleUser,
    ClipboardList,
    MapPin,
    Check,
    SearchX,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Incident } from "@/store/useIncidentReportStore";

type StaffIncidentTrackerProps = {
    incidents: Incident[];
    isLoading: boolean;
    hasFilters?: boolean;
};

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const severityStyles: Record<string, string> = {
    Low: "bg-slate-50 text-slate-500 ring-slate-200",
    Medium: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    High: "bg-orange-50 text-orange-700 ring-orange-100",
    Critical: "bg-red-50 text-red-700 ring-red-100",
};

const trackSteps = ["Pending", "In Progress", "Resolved"] as const;

function getStepIndex(status: Incident["status"]) {
    if (status === "Pending") return 0;
    if (status === "In Progress") return 1;
    return 2;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StatusTracker({ status }: { status: Incident["status"] }) {
    const isClosed = status === "Closed";
    const activeIndex = getStepIndex(status);
    const labels = isClosed
        ? ["Pending", "In Progress", "Closed"]
        : trackSteps;

    return (
        <div className="flex items-center">
            {labels.map((label, index) => {
                const isDone = index < activeIndex;
                const isCurrent = index === activeIndex;
                const isFinal = index === labels.length - 1;

                return (
                    <div key={label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold transition-colors ${
                                    isDone || (isCurrent && isFinal)
                                        ? isFinal && isClosed
                                            ? "border-slate-400 bg-slate-400 text-white"
                                            : "border-emerald-500 bg-emerald-500 text-white"
                                        : isCurrent
                                        ? "border-amber-800 bg-amber-800 text-white"
                                        : "border-slate-200 bg-white text-slate-300"
                                }`}
                            >
                                {isDone || (isCurrent && isFinal) ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span
                                className={`text-[11px] font-medium whitespace-nowrap ${
                                    isDone || isCurrent
                                        ? "text-slate-700"
                                        : "text-slate-300"
                                }`}
                            >
                                {label}
                            </span>
                        </div>

                        {!isFinal && (
                            <div
                                className={`mx-1.5 mb-4 h-0.5 flex-1 rounded-full ${
                                    index < activeIndex
                                        ? "bg-emerald-400"
                                        : "bg-slate-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function StaffIncidentTracker({
    incidents,
    isLoading,
    hasFilters = false,
}: StaffIncidentTrackerProps) {
    if (!isLoading && incidents.length === 0) {
        return (
            <div className="rounded-2xl bg-white/50 py-16 text-center shadow-sm ring-1 ring-slate-200">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    {hasFilters ? (
                        <SearchX className="h-5 w-5 text-amber-800" />
                    ) : (
                        <ClipboardList className="h-5 w-5 text-amber-800" />
                    )}
                </div>
                <p className="text-[13px] font-medium text-slate-700">
                    {hasFilters
                        ? "No reports match your filters"
                        : "No incident reports submitted yet"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    {hasFilters
                        ? "Adjust your search or filters to see more."
                        : "Reports you submit will appear here so you can track their status."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {incidents.map((incident) => {
                const isClosed = incident.status === "Closed";

                return (
                    <article
                        key={incident.incident_id}
                        className="rounded-2xl bg-white/50 p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:ring-slate-300"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1 space-y-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[11px] tracking-tight text-slate-400">
                                        {incident.incident_number}
                                    </span>
                                    <span
                                        className={`${chip} ${
                                            severityStyles[incident.severity] ??
                                            "bg-slate-50 text-slate-500 ring-slate-200"
                                        }`}
                                    >
                                        {incident.severity}
                                    </span>
                                    {isClosed && (
                                        <span
                                            className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}
                                        >
                                            Closed
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-[13px] font-semibold text-slate-900">
                                        {incident.title}
                                    </h3>
                                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500 line-clamp-2">
                                        {incident.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                        {incident.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        {formatDate(incident.created_at)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CircleUser className="h-3.5 w-3.5 text-slate-400" />
                                        {incident.assigned_to_name || "Unassigned"}
                                    </span>
                                </div>
                            </div>

                            {incident.incident_image && (
                                <Dialog>
                                    <DialogTrigger>
                                        <button className="shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 transition hover:ring-amber-300">
                                            <img
                                                src={incident.incident_image}
                                                alt="Incident evidence"
                                                className="h-16 w-16 object-cover transition-transform duration-200 hover:scale-110"
                                            />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="h-auto max-w-3xl rounded-2xl border-0 bg-white p-2">
                                        <img
                                            src={incident.incident_image}
                                            alt="Incident evidence"
                                            className="max-h-[80vh] w-full rounded-xl object-contain"
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <StatusTracker status={incident.status} />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
