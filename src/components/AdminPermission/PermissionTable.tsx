import { useState, useEffect } from "react";
import {
    Eye,
    UserPlus,
    CheckCircle2,
    Trash2,
    EllipsisVertical,
    AlertTriangle,
    ShieldAlert,
    Siren,
    Archive,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import AssignIncidentModal from "./AssignIncidentModal";
import type { Incident } from "@/store/useIncidentReportStore";
import ViewFullReport from "@/components/AdminPermission/ViewFullReport";
import { useToast } from "@/hooks/useToast";

type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const severityConfig: Record<
    IncidentSeverity,
    { icon: typeof Siren; chip: string; tile: string; dot: string }
> = {
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
};

const statusConfig: Record<string, { dot: string; className: string }> = {
    Pending: { dot: "bg-red-500", className: "bg-red-50 text-red-700 ring-red-100" },
    "In Progress": { dot: "bg-blue-500", className: "bg-blue-50 text-blue-700 ring-blue-100" },
    Resolved: { dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    Closed: { dot: "bg-slate-400", className: "bg-slate-50 text-slate-500 ring-slate-200" },
};

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("");
}

type IncidentTableProps = {
    search: string;
    severity: string;
    status: string;
};

export default function IncidentTable({
    search,
    severity,
    status,
}: IncidentTableProps) {
    const [assignTarget, setAssignTarget] = useState<Incident | null>(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const {
        incidents,
        assignIncident,
        reAssignIncident,
        closeIncident,
        archiveIncident,
        isLoading,
    } = useIncidentReport();

    const [closeTarget, setCloseTarget] = useState<Incident | null>(null);
    const [closeOpen, setCloseOpen] = useState(false);

    const [archiveTarget, setArchiveTarget] = useState<Incident | null>(null);
    const [archiveOpen, setArchiveOpen] = useState(false);

    const [viewTarget, setViewTarget] = useState<Incident | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const { showToast } = useToast();

    const filteredIncidents = incidents.filter((incident) => {
        // Closed incidents are covered by the Closed Incident Report, not this list.
        if (incident.status === "Closed") return false;

        const query = search.trim().toLowerCase();

        const matchesSearch =
            query === "" ||
            incident.title.toLowerCase().includes(query) ||
            incident.incident_number.toLowerCase().includes(query) ||
            incident.location.toLowerCase().includes(query) ||
            incident.category.toLowerCase().includes(query);

        const matchesSeverity = severity === "all" || incident.severity === severity;

        const matchesStatus = status === "all" || incident.status === status;

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    useEffect(() => {
        //eslint-disable-next-line
        setCurrentPage(1);
    }, [search, severity, status]);

    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentIncidents = filteredIncidents.slice(startIndex, endIndex);

    // 5.1.2 Assign Incident to Security Personnel
    const handleAssign = async (assignedTo: number, note: string) => {
        if (!assignTarget) return;
        let success = false;

        if (assignTarget.assigned_to) {
            success = await reAssignIncident(assignTarget.incident_id, assignedTo, note);
        } else {
            success = await assignIncident(assignTarget.incident_id, assignedTo, note);
        }

        if (success) {
            showToast(
                "success",
                assignTarget.assigned_to ? "Incident Reassigned" : "Successfully Assigned",
                assignTarget.assigned_to
                    ? "The incident has been reassigned successfully."
                    : "The incident has been assigned to the selected personnel."
            );

            setAssignOpen(false);
            setAssignTarget(null);
        } else {
            showToast(
                "error",
                "Assignment Failed",
                "Unable to assign the incident. Please try again."
            );
        }
    };

    const handleCloseIncident = async () => {
        if (!closeTarget) return;

        const success = await closeIncident(closeTarget.incident_id);

        if (success) {
            setCloseOpen(false);
            setCloseTarget(null);
        }
    };

    const handleArchiveIncident = async () => {
        if (!archiveTarget) return;

        const success = await archiveIncident(archiveTarget.incident_id);

        if (success) {
            showToast(
                "success",
                "Incident Archived",
                `${archiveTarget.incident_number} has been moved to the archive.`
            );
            setArchiveOpen(false);
            setArchiveTarget(null);
        } else {
            showToast(
                "error",
                "Archive Failed",
                "Unable to archive this incident. Please try again."
            );
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="border-slate-100 bg-slate-50/90 backdrop-blur hover:bg-slate-50/90">
                            <TableHead className={`${headCell} w-75 px-5`}>Incident</TableHead>
                            <TableHead className={headCell}>Category</TableHead>
                            <TableHead className={headCell}>Location</TableHead>
                            <TableHead className={headCell}>Severity</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={headCell}>Assigned To</TableHead>
                            <TableHead className={headCell}>Reported</TableHead>
                            <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentIncidents.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={8} className="py-16 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                        <AlertTriangle className="h-5 w-5 text-amber-800" />
                                    </div>

                                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                                        {incidents.length === 0
                                            ? "No incident reports"
                                            : "No matching incidents"}
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        {incidents.length === 0
                                            ? "Reports will appear here once they're submitted."
                                            : "Adjust your search or filters to see more."}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentIncidents.map((incident) => {
                                const sev = severityConfig[incident.severity];
                                const SeverityIcon = sev.icon;
                                const statusStyle = statusConfig[incident.status];

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
                                                    <p className="mt-1 truncate text-[11px] text-slate-700">
                                                        <span className="font-mono tracking-tight">
                                                            {incident.incident_number}
                                                        </span>
                                                        <span className="text-slate-300"> · </span>
                                                        {incident.reported_by_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell className="py-3">
                                            <span className="text-[12.5px] text-slate-600">
                                                {incident.category}
                                            </span>
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell className="py-3">
                                            <span className="text-[12.5px] text-slate-600">
                                                {incident.location}
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
                                            <span className={`${chip} ${statusStyle.className}`}>
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                                />
                                                {incident.status}
                                            </span>
                                        </TableCell>

                                        {/* Assigned To */}
                                        <TableCell className="py-3">
                                            {incident.assigned_to ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[9px] font-semibold text-amber-50">
                                                        {initials(incident.assigned_to_name ?? "")}
                                                    </span>
                                                    <span className="truncate text-[12.5px] text-slate-900">
                                                        {incident.assigned_to_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-700">
                                                    Unassigned
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Reported */}
                                        <TableCell className="py-3">
                                            <p className="whitespace-nowrap text-[12.5px] tabular-nums text-slate-600">
                                                {new Date(incident.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p className="mt-0.5 whitespace-nowrap text-[11px] tabular-nums text-slate-400">
                                                {new Date(incident.created_at).toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </p>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-5 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger >
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-56 rounded-2xl border-0 p-1 shadow-xl ring-1 ring-slate-200"
                                                >
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        onClick={() => {
                                                            setViewTarget(incident);
                                                            setViewOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View full report
                                                    </DropdownMenuItem>

                                                    {/* 5.1.2 Assign Incident to Security Personnel */}
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        onClick={() => {
                                                            setAssignTarget(incident);
                                                            setAssignOpen(true);
                                                        }}
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5" />
                                                        {incident.assigned_to
                                                            ? "Reassign personnel"
                                                            : "Assign personnel"}
                                                    </DropdownMenuItem>

                                                    {/* 5.1.4 Close Incident Report */}
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        disabled={incident.status === "Closed"}
                                                        onClick={() => {
                                                            setCloseTarget(incident);
                                                            setCloseOpen(true);
                                                        }}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Close incident
                                                    </DropdownMenuItem>

                                                    {/* Archive Incident */}
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-slate-700"
                                                        disabled={
                                                            !["Resolved", "Closed"].includes(incident.status)
                                                        }
                                                        onClick={() => {
                                                            setArchiveTarget(incident);
                                                            setArchiveOpen(true);
                                                        }}
                                                    >
                                                        <Archive className="h-3.5 w-3.5" />
                                                        Archive incident
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-slate-100" />

                                                    {/* 5.1.5 Delete Incident Record */}
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-lg text-[12.5px] text-red-600 focus:bg-red-50 focus:text-red-700"
                                                        onClick={() => {
                                                            setDeleteTarget(incident);
                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete record
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-[11px] text-slate-400">
                    Showing{" "}
                    <span className="font-medium tabular-nums text-slate-700">
                        {filteredIncidents.length === 0 ? 0 : startIndex + 1}
                    </span>
                    –
                    <span className="font-medium tabular-nums text-slate-700">
                        {Math.min(endIndex, filteredIncidents.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium tabular-nums text-slate-700">
                        {filteredIncidents.length}
                    </span>{" "}
                    incidents
                </p>

                <div className="flex items-center gap-1.5">

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        aria-label="Previous page"
                        className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i}
                            size="icon"
                            variant="ghost"
                            onClick={() => setCurrentPage(i + 1)}
                            className={`h-7 w-7 rounded-lg text-[11px] font-medium tabular-nums ${currentPage === i + 1
                                ? "bg-amber-800 text-white hover:bg-amber-900 hover:text-white"
                                : "text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {i + 1}
                        </Button>
                    ))}

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        aria-label="Next page"
                        className="h-7 w-7 rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>

                </div>
            </div>

            <AssignIncidentModal
                open={assignOpen}
                onOpenChange={setAssignOpen}
                incident={assignTarget}
                onAssign={handleAssign}
            />

            <ViewFullReport
                open={viewOpen}
                onOpenChange={setViewOpen}
                incident={viewTarget}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[15px]">
                            Delete incident record?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[12.5px]">
                            {deleteTarget && (
                                <>
                                    This will permanently delete{" "}
                                    <span className="font-medium text-slate-700">
                                        {deleteTarget.incident_number}
                                    </span>{" "}
                                    ({deleteTarget.title}). This action cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl text-[12.5px]">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            // onClick={handleDeleteConfirm}
                            className="rounded-xl bg-red-600 text-[12.5px] hover:bg-red-700"
                        >
                            Delete record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Close Incident Modal */}
            <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[15px]">Close incident?</AlertDialogTitle>

                        <AlertDialogDescription className="text-[12.5px]">
                            Are you sure you want to close incident{" "}
                            <span className="font-medium text-slate-700">
                                {closeTarget?.incident_number}
                            </span>
                            ? This will mark the incident as <b>Closed</b>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl text-[12.5px]">
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleCloseIncident}
                            className="rounded-xl bg-emerald-600 text-[12.5px] hover:bg-emerald-700"
                        >
                            {isLoading ? "Closing…" : "Close incident"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Archive Incident Modal */}
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[15px]">
                            Archive incident?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-[12.5px]">
                            Are you sure you want to archive incident{" "}
                            <span className="font-medium text-slate-700">
                                {archiveTarget?.incident_number}
                            </span>
                            ? It will be removed from the active list and can be restored later
                            from Archived Incidents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl text-[12.5px]">
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleArchiveIncident}
                            className="rounded-xl bg-amber-800 text-[12.5px] hover:bg-amber-900"
                        >
                            {isLoading ? "Archiving…" : "Archive incident"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}