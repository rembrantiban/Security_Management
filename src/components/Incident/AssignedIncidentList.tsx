import { useMemo, useState } from "react";
import {
    CheckCircle2,
    ChevronDown,
    Clock3,
    ImageIcon,
    Inbox,
    MapPin,
    MessageSquareText,
    RefreshCw,
    Search,
    SearchX,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssignedIncident } from "@/store/useIncidentReportStore";
import {
    INCIDENT_CHIP,
    SEVERITY_CONFIG,
    STATUS_CHIP,
    formatIncidentDateTime,
    incidentTimeAgo,
    isIncidentOpen,
} from "./incidentUi";

type View = "open" | "resolved" | "all";

type AssignedIncidentListProps = {
    incidents: AssignedIncident[];
    isLoading: boolean;
    onRefresh: () => void;
    onResolve: (incident: AssignedIncident) => void;
};

const VIEWS: { key: View; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "resolved", label: "Resolved" },
    { key: "all", label: "All" },
];

/** Open incidents first, most severe first, newest first. */
function compareIncidents(a: AssignedIncident, b: AssignedIncident) {
    const openDiff = Number(isIncidentOpen(b.status)) - Number(isIncidentOpen(a.status));
    if (openDiff !== 0) return openDiff;

    const sevDiff = SEVERITY_CONFIG[a.severity].rank - SEVERITY_CONFIG[b.severity].rank;
    if (sevDiff !== 0) return sevDiff;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export default function AssignedIncidentList({
    incidents,
    isLoading,
    onRefresh,
    onResolve,
}: AssignedIncidentListProps) {
    const [view, setView] = useState<View>("open");
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState<"All" | AssignedIncident["severity"]>("All");

    const counts = useMemo(() => {
        const open = incidents.filter((i) => isIncidentOpen(i.status)).length;
        return { open, resolved: incidents.length - open, all: incidents.length };
    }, [incidents]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();

        return incidents
            .filter((incident) => {
                const open = isIncidentOpen(incident.status);
                if (view === "open" && !open) return false;
                if (view === "resolved" && open) return false;
                if (severity !== "All" && incident.severity !== severity) return false;
                if (q === "") return true;

                return [incident.title, incident.incident_number, incident.location, incident.category]
                    .some((field) => field.toLowerCase().includes(q));
            })
            .sort(compareIncidents);
    }, [incidents, view, search, severity]);

    const hasFilters = search.trim() !== "" || severity !== "All";

    const clearFilters = () => {
        setSearch("");
        setSeverity("All");
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <div
                    role="tablist"
                    aria-label="Filter assigned incidents"
                    className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto"
                >
                    {VIEWS.map(({ key, label }) => {
                        const active = view === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setView(key)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition sm:flex-none ${
                                    active
                                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {label}
                                <span
                                    className={`rounded-md px-1.5 text-[10.5px] tabular-nums ${
                                        active ? "bg-slate-100 text-slate-700" : "text-slate-400"
                                    }`}
                                >
                                    {counts[key]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, number, location"
                            aria-label="Search assigned incidents"
                            className="h-9 rounded-xl border-0 bg-slate-50 pl-9 pr-8 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as typeof severity)}
                            aria-label="Filter by severity"
                            className="h-9 flex-1 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300 sm:flex-none"
                        >
                            <option value="All">All severities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onRefresh}
                            disabled={isLoading}
                            aria-label="Refresh assigned incidents"
                            className="h-9 w-9 shrink-0 rounded-xl text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading && incidents.length === 0 ? (
                <ListSkeleton />
            ) : incidents.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="No incidents assigned to you"
                    hint="When an administrator dispatches you to an incident, it will appear here."
                />
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={hasFilters ? SearchX : CheckCircle2}
                    title={
                        hasFilters
                            ? "No incidents match your filters"
                            : view === "open"
                              ? "You're all caught up"
                              : "Nothing resolved yet"
                    }
                    hint={
                        hasFilters
                            ? undefined
                            : view === "open"
                              ? "Every incident assigned to you has been resolved."
                              : "Incidents you resolve will be listed here."
                    }
                    action={
                        hasFilters ? (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-2 text-[11.5px] font-medium text-amber-800 hover:underline"
                            >
                                Clear filters
                            </button>
                        ) : undefined
                    }
                />
            ) : (
                <ul className="divide-y divide-slate-100">
                    {visible.map((incident) => (
                        <AssignedIncidentItem
                            key={incident.incident_id}
                            incident={incident}
                            onResolve={() => onResolve(incident)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function AssignedIncidentItem({
    incident,
    onResolve,
}: {
    incident: AssignedIncident;
    onResolve: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const sev = SEVERITY_CONFIG[incident.severity];
    const SeverityIcon = sev.icon;
    const open = isIncidentOpen(incident.status);
    const longDescription = incident.description.length > 160;

    return (
        <li
            className={`relative px-4 py-4 transition-colors hover:bg-slate-50/60 sm:px-5 ${
                open
                    ? `before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-r-full ${sev.accent}`
                    : ""
            }`}
        >
            <div className="flex gap-3.5">
                <div
                    className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 sm:flex ${
                        open ? sev.tile : "bg-slate-50 text-slate-400 ring-slate-200"
                    }`}
                >
                    <SeverityIcon className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h3
                                className={`text-[13.5px] font-semibold leading-snug ${
                                    open ? "text-slate-900" : "text-slate-500"
                                }`}
                            >
                                {incident.title}
                            </h3>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                                <span className="font-mono tracking-tight text-slate-600">
                                    {incident.incident_number}
                                </span>
                                <span aria-hidden="true" className="text-slate-300">•</span>
                                <span>{incident.category}</span>
                                <span aria-hidden="true" className="text-slate-300">•</span>
                                <time
                                    dateTime={incident.created_at}
                                    title={formatIncidentDateTime(incident.created_at)}
                                    className="inline-flex items-center gap-1"
                                >
                                    <Clock3 className="h-3 w-3" />
                                    {incidentTimeAgo(incident.created_at)}
                                </time>
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            <span className={`${INCIDENT_CHIP} ${sev.chip}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                {incident.severity}
                            </span>
                            <span className={`${INCIDENT_CHIP} ${STATUS_CHIP[incident.status]}`}>
                                {incident.status}
                            </span>
                        </div>
                    </div>

                    {/* Meta */}
                    <dl className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]">
                        <Meta icon={MapPin} label="Location" value={incident.location} />
                        <Meta icon={UserRound} label="Reported by" value={incident.reported_by} />
                        {incident.assigned_by && (
                            <Meta icon={ShieldCheck} label="Assigned by" value={incident.assigned_by} />
                        )}
                    </dl>

                    {/* Description */}
                    <p
                        className={`mt-2.5 whitespace-pre-line text-[12.5px] leading-relaxed text-slate-600 ${
                            expanded ? "" : "line-clamp-2"
                        }`}
                    >
                        {incident.description}
                    </p>
                    {longDescription && (
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            aria-expanded={expanded}
                            className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                        >
                            {expanded ? "Show less" : "Show more"}
                            <ChevronDown
                                className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                        </button>
                    )}

                    {/* Dispatch note */}
                    {incident.note && (
                        <div className="mt-3 flex gap-2.5 rounded-xl bg-blue-50/60 px-3 py-2.5 ring-1 ring-blue-100">
                            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                            <p className="min-w-0 text-[12px] leading-relaxed text-blue-900">
                                <span className="font-medium">Dispatch instructions: </span>
                                <span className="whitespace-pre-line">{incident.note}</span>
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        {incident.incident_image ? (
                            <EvidenceButton src={incident.incident_image} />
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                                <ImageIcon className="h-3.5 w-3.5" />
                                No evidence attached
                            </span>
                        )}

                        {open ? (
                            <Button
                                type="button"
                                onClick={onResolve}
                                className="h-8 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-[12px] font-medium text-white hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Resolve
                            </Button>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {incident.status} {incidentTimeAgo(incident.updated_at)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

function Meta({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof MapPin;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-3 w-3 shrink-0 text-slate-400" />
            <dt className="sr-only">{label}</dt>
            <dd className="truncate text-slate-600">{value}</dd>
        </div>
    );
}

function EvidenceButton({ src }: { src: string }) {
    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        className="group inline-flex items-center gap-2 rounded-lg py-0.5 pr-2 text-[11.5px] font-medium text-slate-600 transition hover:text-slate-900"
                    />
                }
            >
                <img
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-md object-cover ring-1 ring-slate-200 transition group-hover:ring-amber-300"
                />
                View evidence
            </DialogTrigger>
            <DialogContent className="max-w-5xl rounded-2xl border-0 bg-white p-2">
                <img
                    src={src}
                    alt="Incident evidence"
                    className="max-h-[85vh] w-full rounded-xl object-contain"
                />
            </DialogContent>
        </Dialog>
    );
}

function EmptyState({
    icon: Icon,
    title,
    hint,
    action,
}: {
    icon: typeof Inbox;
    title: string;
    hint?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                <Icon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-[13px] font-medium text-slate-700">{title}</p>
            {hint && <p className="mx-auto mt-1 max-w-sm text-[11.5px] text-slate-400">{hint}</p>}
            {action}
        </div>
    );
}

function ListSkeleton() {
    return (
        <ul className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading assigned incidents">
            {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex gap-3.5 px-5 py-4">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2.5">
                        <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                    </div>
                </li>
            ))}
        </ul>
    );
}
