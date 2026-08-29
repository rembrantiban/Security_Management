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
    UserX,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import AddBlacklistModal from "@/components/Blacklist/AddBlacklistModal";

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

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const statusConfig = {
    Pending: { className: "bg-amber-50 text-amber-800 ring-amber-100", icon: Clock },
    Approved: { className: "bg-emerald-50 text-emerald-700 ring-emerald-100", icon: CheckCircle2 },
    Rejected: { className: "bg-red-50 text-red-700 ring-red-100", icon: XCircle },
};

const NO_ID = "__none__";

function fullName(r: RequestAccess) {
    return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");
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
    const [identity, setIdentity] = useState("all");
    const [selected, setSelected] = useState<RequestAccess | null>(null);
    const [remarks, setRemarks] = useState("");
    const { requests, approveRequest, rejectRequest, isLoading } = useRequest();
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
    const { showToast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        //eslint-disable-next-line
        setCurrentPage(1);
    }, [search, identity]);

    const identityOptions = useMemo(() => {
        const types = new Set<string>();
        let hasMissing = false;

        requests.forEach((r) => {
            if (r.status !== "Pending") return;
            if (r.id_type) {
                types.add(r.id_type);
            } else {
                hasMissing = true;
            }
        });

        return {
            types: Array.from(types).sort((a, b) => a.localeCompare(b)),
            hasMissing,
        };
    }, [requests]);

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            if (r.status !== "Pending") return false;

            const query = search.trim().toLowerCase();

            const matchesSearch =
                query === "" ||
                fullName(r).toLowerCase().includes(query) ||
                r.request_number.toLowerCase().includes(query);

            const matchesIdentity =
                identity === "all" ||
                (identity === NO_ID ? !r.id_type : r.id_type === identity);

            return matchesSearch && matchesIdentity;
        });
    }, [requests, search, identity]);

    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, currentPage, rowsPerPage]);

    const hasFilters = search.trim() !== "" || identity !== "all";

    const clearFilters = () => {
        setSearch("");
        setIdentity("all");
    };

    const openDetail = (r: RequestAccess) => {
        setSelected(r);
        setRemarks("");
    };

    const approveSelected = async () => {
        if (!selected) return;

        const success = await approveRequest(selected.request_id);

        if (!success) {
            showToast("error", "Approval Failed", "Unable to approve this visitor request.");
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
            showToast("error", "Rejection Failed", "Unable to reject this visitor request.");
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
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                {/* Ambient wash */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                            <Shield className="h-3 w-3" />
                            Visitor &amp; Access Control
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            Visitor Requests
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Verify identification and approve or reject access requests before
                            visitors are cleared for entry.
                        </p>
                    </div>

                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex flex-1 flex-col gap-2.5 lg:flex-row lg:items-center">

                        {/* Search */}
                        <div className="relative w-full lg:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <Input
                                placeholder="Search name or request number"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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

                        {/* Identity filter */}
                        <Select
                            value={identity}
                            onValueChange={(value) => {
                                if (value) {
                                    setIdentity(value);
                                }
                            }}
                        >
                            <SelectTrigger className="h-9 w-full rounded-xl border-0 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-48">
                                <IdCard className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                <SelectValue placeholder="Identity" />
                            </SelectTrigger>

                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="text-[12.5px]">
                                    All identity types
                                </SelectItem>

                                {identityOptions.types.map((type) => (
                                    <SelectItem key={type} value={type} className="text-[12.5px]">
                                        {type}
                                    </SelectItem>
                                ))}

                                {identityOptions.hasMissing && (
                                    <SelectItem value={NO_ID} className="text-[12.5px]">
                                        No ID on file
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </button>
                        )}

                    </div>

                    <span className={`${chip} bg-amber-50 text-amber-800 ring-amber-100`}>
                        <Clock className="h-3 w-3" />
                        {filtered.length} pending
                    </span>

                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                <TableHead className={`${headCell} px-5`}>Visitor</TableHead>
                                <TableHead className={`${headCell} hidden md:table-cell`}>
                                    Purpose
                                </TableHead>
                                <TableHead className={`${headCell} hidden sm:table-cell`}>
                                    Identity
                                </TableHead>
                                <TableHead className={headCell}>Status</TableHead>
                                <TableHead className={`${headCell} hidden lg:table-cell`}>
                                    Requested
                                </TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedRequests.map((r) => {
                                const status = statusConfig[r.status];
                                const StatusIcon = status.icon;

                                return (
                                    <TableRow
                                        key={r.request_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                                    {getInitials(fullName(r))}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {fullName(r)}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-slate-700">
                                                        {r.request_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="hidden max-w-55 truncate py-3 text-[12.5px] text-slate-600 md:table-cell">
                                            {r.purpose}
                                        </TableCell>

                                        <TableCell className="hidden py-3 sm:table-cell">
                                            {r.id_type ? (
                                                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                                    <IdCard className="h-3 w-3 shrink-0 text-slate-700" />
                                                    {r.id_type}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-300">No ID</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <span className={`${chip} ${status.className}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {r.status}
                                            </span>
                                        </TableCell>

                                        <TableCell className="hidden whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-700 lg:table-cell">
                                            {formatDateTime(r.created_at)}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-right">
                                            <Button
                                                size="sm"
                                                className="h-7 gap-1.5 rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-amber-900"
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
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6} className="py-16 text-center">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                            <Inbox className="h-5 w-5 text-amber-800" />
                                        </div>

                                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                                            {hasFilters
                                                ? "No matching requests"
                                                : "No pending visitor requests"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {hasFilters
                                                ? "Adjust your search or identity filter to see more."
                                                : "New requests will appear here as they're submitted."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-[11px] text-slate-400">
                        Showing{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {Math.min(currentPage * rowsPerPage, filtered.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium tabular-nums text-slate-700">
                            {filtered.length}
                        </span>{" "}
                        requests
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

            {/* Review modal — plain overlay, no Radix Dialog (backdrop-blur fix) */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Review access request
                            </p>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                onClick={() => setSelected(null)}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4">

                            {/* Visitor identity */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[13px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                        {getInitials(fullName(selected))}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-[15px] font-semibold leading-none tracking-tight text-slate-900">
                                            {fullName(selected)}
                                        </p>

                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className="font-mono text-[11px] tracking-tight text-slate-400">
                                                {selected.request_number}
                                            </span>
                                            <span
                                                className={`${chip} ${statusConfig[selected.status].className}`}
                                            >
                                                {selected.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 shrink-0 gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-red-600 ring-1 ring-red-100 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => setBlacklistModalOpen(true)}
                                >
                                    <UserX className="h-3.5 w-3.5" />
                                    Blacklist
                                </Button>
                            </div>

                            {/* Purpose */}
                            <div className="mt-5">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                    Purpose of visit
                                </p>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                                    {selected.purpose}
                                </p>
                            </div>

                            {/* ID on file */}
                            <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="flex items-center gap-2 text-[12.5px] text-slate-700">
                                    <IdCard className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span>{selected.id_type ?? "No ID type on file"}</span>
                                </div>

                                {selected.id_image ? (
                                    <img
                                        src={selected.id_image}
                                        alt="Visitor ID"
                                        className="mt-2.5 max-h-40 w-full rounded-lg object-contain"
                                    />
                                ) : (
                                    <p className="mt-2 text-[11px] text-slate-400">
                                        No ID image uploaded.
                                    </p>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600">
                                    <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span>Requested by {selected.requested_by_name}</span>
                                </div>

                                {selected.approved_by_name && (
                                    <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600">
                                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span>
                                            {selected.status === "Rejected" ? "Reviewed" : "Approved"} by{" "}
                                            {selected.approved_by_name}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600">
                                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span className="tabular-nums">
                                        {formatDateTime(selected.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Remarks — only relevant while still pending */}
                            {selected.status === "Pending" && (
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                        Remarks{" "}
                                        <span className="font-normal normal-case tracking-normal text-slate-300">
                                            (optional)
                                        </span>
                                    </label>

                                    <textarea
                                        rows={2}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Add a note for this decision"
                                        className="w-full rounded-xl bg-slate-50 px-3 py-2 text-[12.5px] outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-amber-300"
                                    />
                                </div>
                            )}

                        </div>

                        {/* Footer actions */}
                        {selected.status === "Pending" ? (
                            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
                                <Button
                                    variant="ghost"
                                    className="h-9 gap-1.5 rounded-xl text-[12.5px] font-medium text-red-600 ring-1 ring-red-100 hover:bg-red-50 hover:text-red-700"
                                    disabled={isLoading}
                                    onClick={() => setRejectDialogOpen(true)}
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                </Button>

                                <Button
                                    className="h-9 gap-1.5 rounded-xl bg-emerald-600 text-[12.5px] font-medium hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
                                    disabled={isLoading}
                                    onClick={() => setApproveDialogOpen(true)}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve
                                </Button>
                            </div>
                        ) : (
                            <div className="shrink-0 border-t border-slate-100 p-4">
                                <p className="text-center text-[11px] text-slate-400">
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
                visitorName={selected ? fullName(selected) : undefined}
                requestNumber={selected?.request_number}
                isLoading={isLoading}
                onConfirm={approveSelected}
            />

            <RejectRequestDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                visitorName={selected ? fullName(selected) : undefined}
                requestNumber={selected?.request_number}
                isLoading={isLoading}
                onConfirm={rejectSelected}
            />

            <AddBlacklistModal
                open={blacklistModalOpen}
                onOpenChange={setBlacklistModalOpen}
                initialName={
                    selected
                        ? {
                            first_name: selected.first_name,
                            middle_name: selected.middle_name,
                            last_name: selected.last_name,
                        }
                        : undefined
                }
            />
        </div>
    );
}