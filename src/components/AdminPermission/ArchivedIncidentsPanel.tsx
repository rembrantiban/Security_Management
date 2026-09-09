import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    ArchiveRestore,
    ArrowLeft,
    Clock,
    Loader2,
    MapPin,
    Archive,
    ShieldAlert,
    Siren,
    Search,
    SearchX,
    X,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useToast } from "@/hooks/useToast";
import type { Incident } from "@/store/useIncidentReportStore";

type ArchivedIncidentsPanelProps = {
    onBack: () => void;
};

type IncidentSeverity = Incident["severity"];

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const severityConfig: Record<
    IncidentSeverity,
    { icon: typeof Siren; tile: string; chip: string; dot: string }
> = {
    Critical: {
        icon: Siren,
        tile: "bg-red-50 text-red-600 ring-red-100",
        chip: "bg-red-50 text-red-700 ring-red-100",
        dot: "bg-red-500",
    },
    High: {
        icon: ShieldAlert,
        tile: "bg-orange-50 text-orange-600 ring-orange-100",
        chip: "bg-orange-50 text-orange-700 ring-orange-100",
        dot: "bg-orange-500",
    },
    Medium: {
        icon: AlertTriangle,
        tile: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
    },
    Low: {
        icon: AlertTriangle,
        tile: "bg-slate-50 text-slate-400 ring-slate-200",
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
        dot: "bg-slate-300",
    },
};

const SEVERITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"] as const;

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function ArchivedIncidentsPanel({
    onBack,
}: ArchivedIncidentsPanelProps) {
    const {
        archivedIncidents,
        isFetchingArchived,
        getArchivedIncidents,
        restoreIncident,
    } = useIncidentReport();
    const { showToast } = useToast();

    const [search, setSearch] = useState("");
    const [severity, setSeverity] =
        useState<(typeof SEVERITY_OPTIONS)[number]>("All");
    const [restoringId, setRestoringId] = useState<number | null>(null);

    useEffect(() => {
        getArchivedIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasFilters = search.trim() !== "" || severity !== "All";

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return archivedIncidents
            .filter((incident) => {
                const matchesSearch =
                    query === "" ||
                    incident.title.toLowerCase().includes(query) ||
                    incident.incident_number.toLowerCase().includes(query) ||
                    incident.location.toLowerCase().includes(query) ||
                    incident.category.toLowerCase().includes(query);

                const matchesSeverity =
                    severity === "All" || incident.severity === severity;

                return matchesSearch && matchesSeverity;
            })
            .sort(
                (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
            );
    }, [archivedIncidents, search, severity]);

    const clearFilters = () => {
        setSearch("");
        setSeverity("All");
    };

    const handleRestore = async (incident: Incident) => {
        setRestoringId(incident.incident_id);

        const success = await restoreIncident(incident.incident_id);

        setRestoringId(null);

        if (success) {
            showToast(
                "success",
                "Incident Restored",
                `${incident.incident_number} has been restored to the active list.`
            );
        } else {
            showToast(
                "error",
                "Restore Failed",
                "Unable to restore this incident. Please try again."
            );
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Panel header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Back to active incidents"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                        <Archive className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">
                            Archived Incidents
                        </h2>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                            Incidents removed from the active list — restore any to bring it back.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 self-start rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 ring-1 ring-slate-200 sm:self-auto">
                    {filtered.length} {filtered.length === 1 ? "incident" : "incidents"}
                </span>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title, number, location, or category"
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
                        onChange={(e) =>
                            setSeverity(
                                e.target.value as (typeof SEVERITY_OPTIONS)[number]
                            )
                        }
                        className="h-9 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                    >
                        {SEVERITY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option === "All" ? "All severities" : option}
                            </option>
                        ))}
                    </select>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="h-9 shrink-0 rounded-xl px-2.5 text-[12px] font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            {isFetchingArchived && archivedIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <p className="text-[12px] text-slate-500">
                        Loading archived incidents…
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                        {archivedIncidents.length === 0 ? (
                            <Archive className="h-5 w-5 text-slate-400" />
                        ) : (
                            <SearchX className="h-5 w-5 text-slate-400" />
                        )}
                    </div>

                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                        {archivedIncidents.length === 0
                            ? "No archived incidents"
                            : "No incidents match your filters"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                        {archivedIncidents.length === 0
                            ? "Resolved or closed incidents you archive will appear here."
                            : "Try a different search or severity."}
                    </p>

                    {hasFilters && archivedIncidents.length > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-2 text-[11px] font-medium text-amber-800 hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                <TableHead className={`${headCell} px-5`}>Incident</TableHead>
                                <TableHead className={headCell}>Location</TableHead>
                                <TableHead className={headCell}>Category</TableHead>
                                <TableHead className={headCell}>Severity</TableHead>
                                <TableHead className={headCell}>Archived</TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((incident) => {
                                const config =
                                    severityConfig[incident.severity] ??
                                    severityConfig.Low;
                                const SeverityIcon = config.icon;
                                const isRestoring =
                                    restoringId === incident.incident_id;

                                return (
                                    <TableRow
                                        key={incident.incident_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        {/* Incident */}
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${config.tile}`}
                                                >
                                                    <SeverityIcon className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {incident.title}
                                                    </p>
                                                    <p className="mt-1 font-mono text-[11px] tracking-tight text-slate-700">
                                                        {incident.incident_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                {incident.location}
                                            </div>
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell className="py-3">
                                            <span className="text-[12.5px] text-slate-600">
                                                {incident.category}
                                            </span>
                                        </TableCell>

                                        {/* Severity */}
                                        <TableCell className="py-3">
                                            <span className={`${chip} ${config.chip}`}>
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                                />
                                                {incident.severity}
                                            </span>
                                        </TableCell>

                                        {/* Archived */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] tabular-nums text-slate-600">
                                                <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                                                {formatDate(incident.updated_at)}
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-5 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isRestoring}
                                                onClick={() => handleRestore(incident)}
                                                className="h-8 gap-1.5 rounded-lg border-slate-300 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                {isRestoring ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        Restoring…
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArchiveRestore className="h-3.5 w-3.5" />
                                                        Restore
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
