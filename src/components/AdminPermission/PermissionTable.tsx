import { useState } from "react";
import {
    Eye,
    UserPlus,
    RefreshCw,
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

import AssignIncidentModal from "./AssignIncidentModal";
import UpdateStatusModal from "./UpdateStatusModal";

type IncidentSeverity = "Critical" | "High" | "Moderate" | "Low";
type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";

type IncidentType = {
    id: number;
    reference: string;
    title: string;
    category: string;
    location: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    reported_by: string;
    assigned_to: string | null;
    reported_at: string;
};

const incidents: IncidentType[] = [
    {
        id: 1,
        reference: "INC-2026-0142",
        title: "Unauthorized entry at south gate",
        category: "Security breach",
        location: "South Gate, Main Campus",
        severity: "Critical",
        status: "Open",
        reported_by: "Gate Checkpoint System",
        assigned_to: null,
        reported_at: "10 mins ago",
    },
    {
        id: 2,
        reference: "INC-2026-0141",
        title: "Suspicious package near library entrance",
        category: "Public safety",
        location: "Library Annex",
        severity: "High",
        status: "In Progress",
        reported_by: "Maria Santos",
        assigned_to: "Mark Reyes",
        reported_at: "1 hour ago",
    },
    {
        id: 3,
        reference: "INC-2026-0139",
        title: "Vandalism on parking lot signage",
        category: "Property damage",
        location: "Parking Lot B",
        severity: "Low",
        status: "Resolved",
        reported_by: "John Doe",
        assigned_to: "Anna Cruz",
        reported_at: "Jun 24, 2026",
    },
    {
        id: 4,
        reference: "INC-2026-0136",
        title: "Altercation between students",
        category: "Disturbance",
        location: "Student Commons",
        severity: "Moderate",
        status: "Closed",
        reported_by: "Faculty Office",
        assigned_to: "Mark Reyes",
        reported_at: "Jun 22, 2026",
    },
];

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
    Moderate: {
        icon: AlertTriangle,
        className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    },
    Low: {
        icon: AlertTriangle,
        className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
    },
};

const statusConfig: Record<IncidentStatus, { dot: string; className: string }> = {
    Open: {
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
    const [data, setData] = useState<IncidentType[]>(incidents);

    const [assignTarget, setAssignTarget] = useState<IncidentType | null>(null);
    const [assignOpen, setAssignOpen] = useState(false);

    const [statusTarget, setStatusTarget] = useState<IncidentType | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<IncidentType | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // 5.1.2 Assign Incident to Security Personnel
    const handleAssign = (personnelName: string, note: string) => {
        if (!assignTarget) return;
        setData((prev) =>
            prev.map((item) =>
                item.id === assignTarget.id
                    ? { ...item, assigned_to: personnelName }
                    : item
            )
        );
        console.log("Assignment note:", note);
    };

    // 5.1.3 Update Incident Status
    const handleStatusUpdate = (
        newStatus: IncidentStatus,
        note: string
    ) => {
        if (!statusTarget) return;
        setData((prev) =>
            prev.map((item) =>
                item.id === statusTarget.id ? { ...item, status: newStatus } : item
            )
        );
        console.log("Status update note:", note);
    };

    // 5.1.4 Close Incident Report
    const handleClose = (incident: IncidentType) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === incident.id ? { ...item, status: "Closed" } : item
            )
        );
    };

    // 5.1.5 Delete Incident Record
    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setDeleteOpen(false);
        setDeleteTarget(null);
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
                        {data.map((incident, index) => {
                            const SeverityIcon = severityConfig[incident.severity].icon;

                            return (
                                <TableRow
                                    key={incident.id}
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
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow bg-linear-to-br from-orange-900 to-orange-600 text-white">
                                                <SeverityIcon className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {incident.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {incident.reference} · Reported by{" "}
                                                    {incident.reported_by}
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
                                                {incident.assigned_to}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">
                                                Unassigned
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Reported */}
                                    <TableCell>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            {incident.reported_at}
                                        </span>
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
                                                {/* 5.1.1 View All Incident Reports -> View detail */}
                                                <DropdownMenuItem>
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

                                                {/* 5.1.3 Update Incident Status */}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setStatusTarget(incident);
                                                        setStatusOpen(true);
                                                    }}
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Update Status
                                                </DropdownMenuItem>

                                                {/* 5.1.4 Close Incident Report */}
                                                <DropdownMenuItem
                                                    disabled={incident.status === "Closed"}
                                                    onClick={() => handleClose(incident)}
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
                        })}
                    </TableBody>
                </Table>
            </div>

            <AssignIncidentModal
                open={assignOpen}
                onOpenChange={setAssignOpen}
                incident={assignTarget}
                onAssign={handleAssign}
            />

            <UpdateStatusModal
                open={statusOpen}
                onOpenChange={setStatusOpen}
                incident={statusTarget}
                onUpdate={handleStatusUpdate}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete incident record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget && (
                                <>
                                    This will permanently delete{" "}
                                    <span className="font-medium text-slate-700">
                                        {deleteTarget.reference}
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
                            onClick={handleDeleteConfirm}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                            Delete Record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}