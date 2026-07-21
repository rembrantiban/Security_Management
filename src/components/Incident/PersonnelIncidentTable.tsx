import { useState } from "react";
import {
    MoreVertical,
    Pencil,
    CheckCircle2,
    MapPin,
    Calendar,
    Siren,
    ShieldAlert,
    AlertTriangle,
    ClipboardList,
    CircleUser,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIncidentReport } from "@/hooks/useIncidentsReport"
import type { Incident } from "@/store/useIncidentReportStore";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import  UpdateReportIncidentModal  from "./UpdateReportIncidentModal"


type PersonnelIncidentTableProps = {
    incidents: Incident[];
    onUpdateDetails: (incident: Incident) => void;
    onUploadEvidence: (incident: Incident) => void;
    onMarkResolved: (incident: Incident) => void;
};

const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const severityStyles: Record<string, string> = {
    Low: "bg-gray-100 text-gray-600 border-gray-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
};

const severityConfig = {
    Critical: {
        icon: Siren,
        className:
            "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    },
    High: {
        icon: ShieldAlert,
        className:
            "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
    },
    Medium: {
        icon: AlertTriangle,
        className:
            "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    Low: {
        icon: AlertTriangle,
        className:
            "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
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

    const totalPages = Math.ceil(myIncidents.length / rowsPerPage);

    const paginatedIncidents = myIncidents.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );


    if (myIncidents.length === 0) {
        return (
            <div className="rounded-2xl mt-4 border border-gray-100 bg-white py-16  text-center ">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                    <ClipboardList className="h-7 w-7 text-orange-600" />
                </div>

                <p className="text-sm font-semibold text-gray-700">
                    No incidents reported yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    Incidents you report will appear here.
                </p>
            </div>
        );
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="rounded w-full border border-gray-300 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-300 hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500 py-3.5">
                            Incident
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Location
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Date Reported
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Severity
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Status
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Evidence
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500">
                            Assign to
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500 text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedIncidents.map((incident) => {
                        const isResolved = incident.status === "Resolved";
                        const SeverityIcon = severityConfig[incident.severity].icon;
                        return (
                            <TableRow
                                key={incident.incident_id}
                                className="border border-gray-300 last:border-0 hover:bg-orange-50/40 transition-colors"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow bg-linear-to-br from-orange-900 to-orange-600 text-white">
                                            <SeverityIcon className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {incident.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                # {incident.incident_number}

                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <MapPin size={13} className="text-gray-400 shrink-0" />
                                        {incident.location}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <Calendar size={13} className="text-gray-400 shrink-0" />
                                        {formatDate(incident.created_at)}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full font-medium ${severityStyles[incident.severity]}`}
                                    >
                                        {incident.severity}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full font-medium ${statusStyles[incident.status]}`}
                                    >
                                        {incident.status}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger>
                                            <button className="overflow-hidden rounded border border-gray-200 shadow-sm">
                                                <img
                                                    src={incident.incident_image!}
                                                    alt="Incident Evidence"
                                                    className="h-12 w-12 object-cover transition-transform hover:scale-110"
                                                />
                                            </button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-7xl h-auto rounded bg-white/95 border-0 p-2">
                                            <div className="space-y-3">
                                                <img
                                                    src={incident.incident_image!}
                                                    alt="Incident Evidence"
                                                    className="w-full max-h-[85vh] rounded object-contain"
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-1.5 ">
                                        <CircleUser className="text-amber-700" size={20} />
                                        <p>{incident.assigned_to_name || 'Unassigned'}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu
                                        open={openMenuId === incident.incident_id}
                                        onOpenChange={(open) => setOpenMenuId(open ? incident.incident_id : null)}
                                    >
                                        <DropdownMenuTrigger>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-orange-700 hover:bg-orange-50"
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            className="w-52 rounded-xl border border-gray-200 shadow-lg p-1"
                                        >
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedIncident(incident);
                                                    setUpdateModalOpen(true);
                                                }}
                                                disabled={isResolved}
                                                className="rounded-lg cursor-pointer gap-2 text-gray-700 hover:text-orange-700 hover:bg-orange-50 focus:text-orange-700 focus:bg-orange-50"
                                            >
                                                <Pencil size={14} />
                                                Update Details
                                            </DropdownMenuItem>

                                        
                                            <DropdownMenuSeparator className="bg-gray-100" />

                                            <DropdownMenuItem
                                                onClick={() => onMarkResolved(incident)}
                                                disabled={isResolved}
                                                className="rounded-lg cursor-pointer gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 focus:text-emerald-700 focus:bg-emerald-50 disabled:text-gray-300"
                                            >
                                                <CheckCircle2 size={14} />
                                                {isResolved ? "Already Resolved" : "Mark as Resolved"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    {/* Left */}
                    <div className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">
                            {myIncidents.length === 0
                                ? 0
                                : (currentPage - 1) * rowsPerPage + 1}
                        </span>

                        {" "}to{" "}

                        <span className="font-semibold text-slate-800">
                            {Math.min(currentPage * rowsPerPage, myIncidents.length)}
                        </span>

                        {" "}of{" "}

                        <span className="font-semibold text-slate-800">
                            {myIncidents.length}
                        </span>{" "}
                        incidents
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-2">

                            <span className="text-sm text-slate-500">
                                Rows
                            </span>

                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>

                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Previous
                        </Button>

                        <span className="rounded-md border bg-white px-3 py-1 text-sm font-medium shadow-sm">
                            {currentPage} / {totalPages || 1}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                currentPage === totalPages ||
                                totalPages === 0
                            }
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next
                        </Button>

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