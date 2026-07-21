import { useEffect, useMemo, useState } from "react";
import {
    Search,
    IdCard,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Building2,
    X,
    Eye,
    Shield,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRequest } from "@/hooks/useRequest";
import RejectRequestDialog from "@/components/Request/RejectRequestModal";
import { useToast } from "@/hooks/useToast";
import ApproveRequestDialog from "@/components/Request/ApproveRequestModal";


export interface RequestAccess {
    request_id: number;
    request_number: string;

    requested_by: number;
    requested_by_name: string;

    first_name: string;
    middle_name: string | null;
    last_name: string;

    id_type: string | null;
    id_image: string | null;

    purpose: string;

    status: "Pending" | "Approved" | "Rejected";

    approved_by: number | null;
    approved_by_name: string | null;

    approved_at: string | null;
    created_at: string;
    updated_at: string;
}

// TODO: replace with a real data hook, e.g. `const { requests, isLoading, approve, reject } = useVisitorRequests();`

const statusConfig = {
    Pending: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    Approved: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    Rejected: { className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const statusFilters = ["All", "Pending", "Approved", "Rejected"] as const;
type StatusFilter = (typeof statusFilters)[number];

function fullName(r: RequestAccess) {
    return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");
}

function getInitials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

function formatDateTime(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function AdminVisitorRequestsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Pending");
    const [selected, setSelected] = useState<RequestAccess | null>(null);
    const [remarks, setRemarks] = useState("");
    const { requests, approveRequest, rejectRequest, isLoading } = useRequest();
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const { showToast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

  

    useEffect(() => {
        //eslint-disable-next-line
        setCurrentPage(1);
    }, [search, statusFilter]);

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchesStatus = statusFilter === "All" || r.status === statusFilter;
            const matchesSearch =
                search.trim() === "" ||
                fullName(r).toLowerCase().includes(search.toLowerCase()) ||
                r.request_number.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [requests, search, statusFilter]);

        const totalPages = Math.ceil(filtered.length / rowsPerPage);

      const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, currentPage, rowsPerPage]);

    const counts = useMemo(
        () => ({
            Pending: requests.filter((r) => r.status === "Pending").length,
            Approved: requests.filter((r) => r.status === "Approved").length,
            Rejected: requests.filter((r) => r.status === "Rejected").length,
            All: requests.length,
        }),
        [requests]
    );

    const openDetail = (r: RequestAccess) => {
        setSelected(r);
        setRemarks("");
    };

    const approveSelected = async () => {
        if (!selected) return;

        const success = await approveRequest(selected.request_id);

        if (!success) {
            showToast(
                "error",
                "Approval Failed",
                "Unable to approve this visitor request."
            );
            return;
        }

        showToast(
            "success",
            "Request Approved",
            "The visitor request has been approved successfully."
        );

        setApproveDialogOpen(false);
        setSelected(null);
    };


    const rejectSelected = async () => {
        if (!selected) return;

        const success = await rejectRequest(selected.request_id);

        if (!success) {
            showToast(
                "error",
                "Rejection Failed",
                "Unable to reject this visitor request."
            );
            return;
        }

        showToast(
            "success",
            "Request Rejected",
            "The visitor request has been rejected successfully."
        );

        setRejectDialogOpen(false);
        setSelected(null);
    };

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded border border-orange-100 bg-white shadow-sm">

                {/* Background */}
                <div className="absolute inset-0 bg-linear-to-r from-orange-50 via-white to-orange-100" />

                {/* Decorative blur */}
                <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl" />

                <div className="relative flex flex-col gap-6 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Left */}
                    <div>

                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                            <Shield className="h-3.5 w-3.5" />
                            Visitor and Access Control Management
                        </span>

                        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                            Visitor Requests
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600">
                            Review, approve, or reject visitor access requests submitted by campus visitors.
                            Verify identification documents, monitor request statuses, and ensure that only
                            authorized individuals are granted access to the campus.
                        </p>

                    </div>
                </div>

            </div>

            {/* Toolbar */}
            <Card className="rounded border-slate-200 shadow-sm">
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search name or request #"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg pl-9"
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {statusFilters.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${statusFilter === s
                                    ? "border-orange-600 bg-orange-600 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {s}
                                {s !== "All" && <span className="ml-1 opacity-70">({counts[s]})</span>}
                            </button>
                        ))}
                    </div>

                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden rounded border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/60">
                                <TableHead>Visitor</TableHead>
                                <TableHead className="hidden md:table-cell">Purpose</TableHead>
                                <TableHead className="hidden sm:table-cell">Identity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Requested</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRequests.map((r) => {
                                const StatusIcon = statusConfig[r.status].icon;
                                return (
                                    <TableRow key={r.request_id} className="hover:bg-slate-50/60">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback className="bg-orange-100 text-xs font-semibold text-orange-700">
                                                        {getInitials(fullName(r))}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {fullName(r)}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-400">
                                                        {r.request_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden max-w-55 truncate text-sm text-slate-600 md:table-cell">
                                            {r.purpose}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <span className="text-sm text-slate-600">
                                                {r.id_type ?? "No ID"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig[r.status].className}`}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden text-sm text-slate-500 lg:table-cell">
                                            {formatDateTime(r.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 rounded-lg"
                                                onClick={() => openDetail(r)}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                                        No visitor requests match your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                          
                        </TableBody>
                        
                    </Table>
                </div>
                  <div className="flex flex-col gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {filtered.length === 0
                                        ? 0
                                        : (currentPage - 1) * rowsPerPage + 1}
                                </span>

                                {" "}to{" "}

                                <span className="font-semibold text-slate-800">
                                    {Math.min(currentPage * rowsPerPage, filtered.length)}
                                </span>

                                {" "}of{" "}

                                <span className="font-semibold text-slate-800">
                                    {filtered.length}
                                </span>{" "}
                                requests
                            </div>

                            <div className="flex items-center gap-4">

                                <div className="flex items-center gap-2 text-sm">

                                    <span className="text-slate-500">
                                        Rows
                                    </span>

                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm"
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

                                <span className="text-sm font-medium text-slate-600">
                                    {currentPage} / {totalPages || 1}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    Next
                                </Button>

                            </div>

                        </div>
            </Card>

            {/* Review modal — plain overlay, no Radix Dialog (backdrop-blur fix) */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex w-full max-w-2xl max-h-[90vh]  flex-col overflow-hidden rounded-sm bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Review Access Request
                            </h2>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                                onClick={() => setSelected(null)}
                            >
                                <X className="h-4.5 w-4.5" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4">

                            {/* Visitor identity */}
                            <div className="flex items-start gap-3">
                                <Avatar className="h-11 w-11">
                                    <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">
                                        {getInitials(fullName(selected))}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">
                                        {fullName(selected)}
                                    </p>
                                    <p className="text-xs text-slate-400">{selected.request_number}</p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge className={`rounded-full border px-3 py-0.5 text-xs font-medium ${statusConfig[selected.status].className}`}>
                                    {selected.status}
                                </Badge>
                            </div>

                            {/* Purpose */}
                            <div className="mt-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Purpose of Visit
                                </p>
                                <p className="mt-1 text-sm text-slate-700">{selected.purpose}</p>
                            </div>

                            {/* ID on file */}
                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <IdCard className="h-4 w-4 text-slate-400" />
                                    <span>{selected.id_type ?? "No ID type on file"}</span>
                                </div>

                                {selected.id_image ? (
                                    <img
                                        src={selected.id_image}
                                        alt="Visitor ID"
                                        className="mt-2 max-h-40 w-full rounded-lg object-contain"
                                    />
                                ) : (
                                    <p className="mt-2 text-xs text-slate-400">No ID image uploaded.</p>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2.5 text-slate-600">
                                    <User className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>Requested by {selected.requested_by_name}</span>
                                </div>
                                {selected.approved_by_name && (
                                    <div className="flex items-center gap-2.5 text-slate-600">
                                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                                        <span>
                                            {selected.status === "Rejected" ? "Reviewed" : "Approved"} by{" "}
                                            {selected.approved_by_name}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 text-slate-600">
                                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>{formatDateTime(selected.created_at)}</span>
                                </div>
                            </div>

                            {/* Remarks — only relevant while still pending */}
                            {selected.status === "Pending" && (
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                        Remarks <span className="font-normal text-slate-400">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Add a note for this decision..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                    />
                                </div>
                            )}

                        </div>

                        {/* Footer actions */}
                        {selected.status === "Pending" ? (
                            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
                                <Button
                                    variant="outline"
                                    className="gap-1.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                    disabled={isLoading}
                                    onClick={() => setRejectDialogOpen(true)}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
                                    disabled={isLoading}
                                    onClick={() => setApproveDialogOpen(true)}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        ) : (
                            <div className="shrink-0 border-t border-slate-100 p-4">
                                <p className="text-center text-xs text-slate-400">
                                    This request has already been {selected.status.toLowerCase()}.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            )}

            <ApproveRequestDialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
                visitorName={
                    selected
                        ? fullName(selected)
                        : undefined
                }
                requestNumber={selected?.request_number}
                isLoading={isLoading}
                onConfirm={approveSelected}
            />

            <RejectRequestDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                visitorName={
                    selected
                        ? fullName(selected)
                        : undefined
                }
                requestNumber={selected?.request_number}
                isLoading={isLoading}
                onConfirm={rejectSelected}
            />
        </div>
    );
}
