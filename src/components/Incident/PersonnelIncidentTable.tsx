import { useEffect, useMemo, useState } from "react";
import {
    MoreVertical,
    Pencil,
    CheckCircle2,
    MapPin,
    Siren,
    ShieldAlert,
    AlertTriangle,
    ClipboardList,
    ImageOff,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    SearchX,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import type { Incident } from "@/store/useIncidentReportStore";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UpdateReportIncidentModal from "./UpdateReportIncidentModal";

type PersonnelIncidentTableProps = {
    incidents: Incident[];
    onUpdateDetails: (incident: Incident) => void;
    onUploadEvidence: (incident: Incident) => void;
    onMarkResolved: (incident: Incident) => void;
};

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-100",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-100",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const severityConfig = {
    Critical: {
        icon: Siren,
        chip: "bg-red-50 text-red-700 ring-red-100",
        tile: "bg-red-50 text-red-600 ring-red-100",
        dot: "bg-red-500",
    },
    High: {
        icon: ShieldAlert,
        chip: "bg-orange-50 text-orange-700 ring-orange-100",
        tile: "bg-orange-50 text-orange-600 ring-orange-100",
        dot: "bg-orange-500",
    },
    Medium: {
        icon: AlertTriangle,
        chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        tile: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        dot: "bg-yellow-500",
    },
    Low: {
        icon: AlertTriangle,
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
        tile: "bg-slate-50 text-slate-400 ring-slate-200",
        dot: "bg-slate-300",
    },
} as const;

export default function PersonnelIncidentTable({
    onMarkResolved,
}: PersonnelIncidentTableProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const { myIncidents } = useIncidentReport();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [severityFilter, setSeverityFilter] = useState("All");

    const hasFilters =
        search.trim() !== "" || statusFilter !== "All" || severityFilter !== "All";

    const filteredIncidents = useMemo(() => {
        const q = search.trim().toLowerCase();

        return myIncidents.filter((incident) => {
            const matchesSearch =
                q === "" ||
                incident.title.toLowerCase().includes(q) ||
                incident.incident_number.toLowerCase().includes(q) ||
                incident.location.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === "All" || incident.status === statusFilter;

            const matchesSeverity =
                severityFilter === "All" || incident.severity === severityFilter;

            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [myIncidents, search, statusFilter, severityFilter]);

    const totalPages = Math.ceil(filteredIncidents.length / rowsPerPage);

    const paginatedIncidents = filteredIncidents.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useEffect(() => {
        //eslint-disable-next-line
        setCurrentPage(1);
    }, [search, statusFilter, severityFilter, rowsPerPage]);

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("All");
        setSeverityFilter("All");
    };

    if (myIncidents.length === 0) {
        return (
            <div className="mt-4 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <ClipboardList className="h-5 w-5 text-amber-800" />
                </div>

                <p className="mt-3 text-[13px] font-medium text-slate-700">
                    No incidents reported yet
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                    Incidents you report will appear here.
                </p>
            </div>
        );
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="w-full overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

            {/* Search & filter toolbar */}
            <div className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative w-full lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title, number, or location"
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
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                    >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="h-9 rounded-xl bg-slate-50 px-2.5 text-[12px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                    >
                        <option value="All">All severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
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

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className={`${headCell} px-5`}>Incident</TableHead>
                            <TableHead className={headCell}>Location</TableHead>
                            <TableHead className={headCell}>Reported</TableHead>
                            <TableHead className={headCell}>Severity</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={headCell}>Evidence</TableHead>
                            <TableHead className={headCell}>Assigned to</TableHead>
                            <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedIncidents.map((incident) => {
                            const isResolved =
                                incident.status === "Resolved" ||
                                incident.status === "Closed";
                            const sev = severityConfig[incident.severity];
                            const SeverityIcon = sev.icon;

                            return (
                                <TableRow
                                    key={incident.incident_id}
                                    className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    {/* Incident */}
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.tile}`}
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

                                    {/* Reported */}
                                    <TableCell className="py-3">
                                        <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-700">
                                            {formatDate(incident.created_at)}
                                        </span>
                                    </TableCell>

                                    {/* Severity */}
                                    <TableCell className="py-3">
                                        <span className={`${chip} ${sev.chip}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                            {incident.severity}
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-3">
                                        <span className={`${chip} ${statusStyles[incident.status]}`}>
                                            {incident.status}
                                        </span>
                                    </TableCell>

                                    {/* Evidence */}
                                    <TableCell className="py-3">
                                        {incident.incident_image ? (
                                            <Dialog>
                                                <DialogTrigger >
                                                    <button className="block h-10 w-10 overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-amber-300">
                                                        <img
                                                            src={incident.incident_image}
                                                            alt="Incident evidence"
                                                            className="h-full w-full object-cover transition-transform duration-200 hover:scale-110"
                                                        />
                                                    </button>
                                                </DialogTrigger>

                                                <DialogContent className="max-w-5xl rounded-2xl border-0 bg-white p-2">
                                                    <img
                                                        src={incident.incident_image}
                                                        alt="Incident evidence"
                                                        className="max-h-[85vh] w-full rounded-xl object-contain"
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                                                <ImageOff className="h-3.5 w-3.5 text-slate-300" />
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Assigned to */}
                                    <TableCell className="py-3">
                                        {incident.assigned_to_name ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[9px] font-semibold text-amber-500">
                                                    {incident.assigned_to_name
                                                        .split(" ")
                                                        .filter(Boolean)
                                                        .slice(-2)
                                                        .map((part) => part[0])
                                                        .join("")}
                                                </span>
                                                <span className="truncate text-[12.5px] text-slate-700">
                                                    {incident.assigned_to_name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-slate-900">Unassigned</span>
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="px-5 py-3 text-right">
                                        <DropdownMenu
                                            open={openMenuId === incident.incident_id}
                                            onOpenChange={(open) =>
                                                setOpenMenuId(open ? incident.incident_id : null)
                                            }
                                        >
                                            <DropdownMenuTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                className="w-52 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-slate-200"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedIncident(incident);
                                                        setUpdateModalOpen(true);
                                                    }}
                                                    disabled={isResolved}
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Update details
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-slate-100" />

                                                <DropdownMenuItem
                                                    onClick={() => onMarkResolved(incident)}
                                                    disabled={isResolved}
                                                    className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {isResolved ? "Already resolved" : "Mark as resolved"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {filteredIncidents.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={8} className="py-14 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                        <SearchX className="h-5 w-5 text-slate-400" />
                                    </div>

                                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                                        No incidents match your filters
                                    </p>

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-2 text-[11px] font-medium text-amber-800 hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-5 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <p className="text-[11px] text-slate-400">
                        Showing{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {filteredIncidents.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {Math.min(currentPage * rowsPerPage, filteredIncidents.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {filteredIncidents.length}
                        </span>{" "}
                        {hasFilters ? "matching" : ""} incidents
                    </p>

                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Rows</span>

                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="h-7 rounded-lg bg-white px-2 text-[11px] text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-amber-300"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                aria-label="Previous page"
                                className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>

                            <span className="px-1 text-[11px] tabular-nums text-slate-500">
                                {currentPage} / {totalPages || 1}
                            </span>

                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                aria-label="Next page"
                                className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                    </div>
                </div>
            </div>

            <UpdateReportIncidentModal
                open={updateModalOpen}
                onOpenChange={setUpdateModalOpen}
                incident={selectedIncident}
            />
        </div>
    );
}