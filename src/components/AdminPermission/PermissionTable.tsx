import { useState } from "react";
import {
    Eye,
    UserPlus,
    CheckCircle2,
    Trash2,
    EllipsisVertical,
    AlertTriangle,
    ShieldAlert,
    Siren,
    Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { Incident } from "@/store/useIncidentReportStore"
import ViewFullReport from "@/components/AdminPermission/ViewFullReport"
import { useToast } from "@/hooks/useToast";


type IncidentSeverity =
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

//type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";


const severityConfig: Record<
    IncidentSeverity,
    { icon: typeof Siren; className: string }
> = {
    Critical: {
        icon: Siren,
        className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
    High: {
        icon: ShieldAlert,
        className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    },
    Medium: {
        icon: AlertTriangle,
        className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    },
    Low: {
        icon: AlertTriangle,
        className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
    },
};

const statusConfig: Record<string, { dot: string; className: string }> = {
    Pending: {
        dot: "●",
        className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
    "In Progress": {
        dot: "●",
        className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    },
    Resolved: {
        dot: "●",
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    },
    Closed: {
        dot: "●",
        className: "bg-slate-200 text-slate-600 hover:bg-slate-200",
    },
};



export default function IncidentTable() {
    const [assignTarget, setAssignTarget] = useState<Incident | null>(null);
    const [assignOpen, setAssignOpen] = useState(false);
    //const [statusTarget, setStatusTarget] = useState<Incident | null>(null);
    //const [statusOpen, setStatusOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { incidents, assignIncident, reAssignIncident, closeIncident, isLoading } = useIncidentReport()

    const [closeTarget, setCloseTarget] = useState<Incident | null>(null);
    const [closeOpen, setCloseOpen] = useState(false);

    const [viewTarget, setViewTarget] = useState<Incident | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const { showToast } = useToast();

    const totalPages = Math.ceil(incidents.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentIncidents = incidents.slice(startIndex, endIndex);

    // 5.1.2 Assign Incident to Security Personnel
    const handleAssign = async (
        assignedTo: number,
        note: string
    ) => {
        if (!assignTarget) return;
        let success = false;

        if (assignTarget.assigned_to) {
            success = await reAssignIncident(
                assignTarget.incident_id,
                assignedTo,
                note
            );
        } else {
            success = await assignIncident(
                assignTarget.incident_id,
                assignedTo,
                note
            );
        }

        if (success) {
            showToast(
                "success",
                assignTarget.assigned_to
                    ? "Incident Reassigned"
                    : "Successfully Assigned",
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

    return (
        <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 z-10">
                        <TableRow>
                            <TableHead className="w-80">Incident</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Reported</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentIncidents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-72 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                No Incident Reports
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                There are currently no incident reports available.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (currentIncidents.map((incident, index) => {
                            const SeverityIcon = severityConfig[incident.severity].icon;

                            return (
                                <TableRow
                                    key={incident.incident_id}
                                    className={`
                                        transition-all
                                        duration-300
                                        hover:bg-orange-50
                                        hover:shadow-sm
                                        ${index % 2 === 0
                                            ? "bg-white"
                                            : "bg-slate-50/60"
                                        }
                                    `}
                                >
                                    {/* Incident */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow bg-linear-to-br from-orange-900 to-orange-600 text-white">
                                                <SeverityIcon className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {incident.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {incident.incident_number} · Reported by{" "}
                                                    {incident.reported_by_name}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Category */}
                                    <TableCell>
                                        <span className="text-slate-600">
                                            {incident.category}
                                        </span>
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell>
                                        <span className="text-slate-600">
                                            {incident.location}
                                        </span>
                                    </TableCell>

                                    {/* Severity */}
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full ${severityConfig[incident.severity].className}`}
                                        >
                                            {incident.severity}
                                        </Badge>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full ${statusConfig[incident.status].className}`}
                                        >
                                            {statusConfig[incident.status].dot} {incident.status}
                                        </Badge>
                                    </TableCell>

                                    {/* Assigned To */}
                                    <TableCell>
                                        {incident.assigned_to ? (
                                            <span className="font-medium text-slate-700">
                                                {incident.assigned_to_name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">
                                                Unassigned
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Reported */}
                                    <TableCell>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 rounded-lg bg-orange-100 p-1.5">
                                                <Clock className="h-3.5 w-3.5 text-orange-700" />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-800">
                                                    {new Date(incident.created_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {new Date(incident.created_at).toLocaleTimeString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger >
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="rounded-xl"
                                                >
                                                    <EllipsisVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-56 rounded-xl"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        console.log("CLICKED");
                                                        console.log(incident);

                                                        setViewTarget(incident);
                                                        setViewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Full Report
                                                </DropdownMenuItem>

                                                {/* 5.1.2 Assign Incident to Security Personnel */}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setAssignTarget(incident);
                                                        setAssignOpen(true);
                                                    }}
                                                >
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    {incident.assigned_to
                                                        ? "Reassign Personnel"
                                                        : "Assign Personnel"}
                                                </DropdownMenuItem>


                                                {/* 5.1.4 Close Incident Report */}
                                                <DropdownMenuItem
                                                    disabled={incident.status === "Closed"}
                                                    onClick={() => {
                                                        setCloseTarget(incident);
                                                        setCloseOpen(true);
                                                    }}
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Close Incident
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                {/* 5.1.5 Delete Incident Record */}
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setDeleteTarget(incident);
                                                        setDeleteOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Record
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        }))}


                    </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t bg-white px-6 py-4">

                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold">
                            {incidents.length === 0 ? 0 : startIndex + 1}
                        </span>{" "}
                        -
                        <span className="font-semibold">
                            {Math.min(endIndex, incidents.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                            {incidents.length}
                        </span>{" "}
                        incidents
                    </p>

                    <div className="flex items-center gap-2">

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((prev) => prev - 1)
                            }
                        >
                            Previous
                        </Button>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => (
                                <Button
                                    key={i}
                                    size="sm"
                                    variant={
                                        currentPage === i + 1
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        setCurrentPage(i + 1)
                                    }
                                    className={
                                        currentPage === i + 1
                                            ? "bg-orange-600 hover:bg-orange-700"
                                            : ""
                                    }
                                >
                                    {i + 1}
                                </Button>
                            )
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((prev) => prev + 1)
                            }
                        >
                            Next
                        </Button>

                    </div>

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

            {/* <UpdateStatusModal
                open={statusOpen}
                onOpenChange={setStatusOpen}
                incident={statusTarget}
                onUpdate={handleStatusUpdate}
            /> */}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete incident record?</AlertDialogTitle>
                        <AlertDialogDescription>
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
                        <AlertDialogCancel className="rounded-xl">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            // onClick={handleDeleteConfirm}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                            Delete Record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>




            {/* Close Incident Modal */}
            <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Close Incident?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to close incident{" "}
                            <span className="font-semibold">
                                {closeTarget?.incident_number}
                            </span>
                            ? This will mark the incident as <b>Closed</b>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleCloseIncident}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isLoading ? "Closing..." : "Close Incident"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}