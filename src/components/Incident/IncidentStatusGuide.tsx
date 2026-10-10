import { ChevronRight, Info } from "lucide-react";
import { INCIDENT_STATUSES } from "./incidentStatus";

/** Explains each incident status in the order a report moves through them. */
export default function IncidentStatusGuide() {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <h2 className="text-[12px] font-semibold tracking-tight text-slate-900">
                    Status workflow
                </h2>
                <span className="text-[11px] text-slate-400">
                    How an incident report moves from submission to closure
                </span>
            </div>

            <ol className="grid gap-px overflow-hidden rounded-b-2xl bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
                {INCIDENT_STATUSES.map((status, index) => (
                    <li key={status.key} className="relative bg-white px-5 py-3.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium tabular-nums text-slate-400">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: status.color }}
                                aria-hidden="true"
                            />
                            <p className="text-[12.5px] font-medium text-slate-900">{status.key}</p>
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
                            {status.description}
                        </p>

                        {index < INCIDENT_STATUSES.length - 1 && (
                            <ChevronRight
                                className="absolute right-2 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-slate-300 lg:block"
                                aria-hidden="true"
                            />
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}
