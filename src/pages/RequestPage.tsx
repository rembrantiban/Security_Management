import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    IdCard,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Building2,
    X,
    Eye,
    LogOut,
    Printer,
    ShieldCheck,
    Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import RegisterVisitorModal from "@/components/Request/RegisterVisitorModal";
import ApproveRequestDialog from "@/components/Request/ApproveRequestModal";
import RejectRequestDialog from "@/components/Request/RejectRequestModal";
import VisitorPassModal from "@/components/Request/VisitorPassModal";
import { useRequest } from "@/hooks/useRequest";
import { useToast } from "@/hooks/useToast";

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
    checked_out_at: string | null;
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

const statusFilters = ["All", "Pending", "Approved", "Rejected"] as const;
type StatusFilter = (typeof statusFilters)[number];

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

export default function VisitorRequestsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [selected, setSelected] = useState<RequestAccess | null>(null);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [passModalOpen, setPassModalOpen] = useState(false);
    const { myRequests, approveRequest, rejectRequest, checkOutVisitor, isLoading } =
        useRequest();
    const { showToast } = useToast();

    const filtered = useMemo(() => {
        return myRequests.filter((r) => {
            const matchesStatus = statusFilter === "All" || r.status === statusFilter;
            const query = search.trim().toLowerCase();
            const matchesSearch =
                query === "" ||
                fullName(r).toLowerCase().includes(query) ||
                r.request_number.toLowerCase().includes(query) ||
                r.purpose.toLowerCase().includes(query) ||
                (r.id_type ?? "").toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });
    }, [myRequests, search, statusFilter]);

    const counts = useMemo(
        () => ({
            Pending: myRequests.filter((r) => r.status === "Pending").length,
            Approved: myRequests.filter((r) => r.status === "Approved").length,
            Rejected: myRequests.filter((r) => r.status === "Rejected").length,
            All: myRequests.length,
        }),
        [myRequests]
    );

    const hasFilters = search.trim() !== "" || statusFilter !== "All";

    const openDetail = (r: RequestAccess) => {
        setSelected(r);
    };

    const approveSelected = async () => {
        if (!selected) return;

        const success = await approveRequest(selected.request_id);

        if (success) {
            showToast(
                "success",
                "Identity Verified",
                `${fullName(selected)}'s request has been approved.`
            );
            setSelected((prev) => (prev ? { ...prev, status: "Approved" } : prev));
        } else {
            showToast("error", "Approval Failed", "Something went wrong.");
        }

        setApproveDialogOpen(false);
    };

    const rejectSelected = async () => {
        if (!selected) return;

        const success = await rejectRequest(selected.request_id);

        if (success) {
            showToast(
                "success",
                "Request Rejected",
                `${fullName(selected)}'s request has been rejected.`
            );
            setSelected((prev) => (prev ? { ...prev, status: "Rejected" } : prev));
        } else {
            showToast("error", "Action Failed", "Something went wrong.");
        }

        setRejectDialogOpen(false);
    };

    const handleRecordExit = async () => {
        if (!selected) return;

        const success = await checkOutVisitor(selected.request_id);

        if (success) {
            showToast(
                "success",
                "Exit Recorded",
                `${fullName(selected)} has been marked as exited.`
            );
            setSelected((prev) =>
                prev ? { ...prev, checked_out_at: new Date().toISOString() } : prev
            );
        } else {
            showToast("error", "Action Failed", "Unable to record visitor exit.");
        }
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
                            <ShieldCheck className="h-3 w-3" />
                            Visitor &amp; Access Control
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            Visitor Access Requests
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Register visitors, verify identity against uploaded ID, issue
                            passes, and record entry and exit times.
                        </p>
                    </div>

                    <Button
                        onClick={() => setRegisterModalOpen(true)}
                        className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Register visitor entry
                    </Button>

                </div>
            </div>

            {/* Toolbar + Table */}
            <div className="w-full overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">

                {/* Toolbar */}
                <div className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            placeholder="Search name, request number, purpose, or ID"
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

                    {/* Segmented status filter */}
                    <div className="flex shrink-0 items-center gap-0.5 self-start rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200 lg:self-auto">
                        {statusFilters.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatusFilter(s)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${statusFilter === s
                                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                {s}
                                <span
                                    className={`tabular-nums ${statusFilter === s ? "text-amber-700/70" : "text-slate-400"
                                        }`}
                                >
                                    {counts[s]}
                                </span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                <TableHead className={`${headCell} px-5`}>Visitor</TableHead>
                                <TableHead className={`${headCell} hidden md:table-cell`}>
                                    Purpose
                                </TableHead>
                                <TableHead className={`${headCell} hidden sm:table-cell`}>
                                    ID Type
                                </TableHead>
                                <TableHead className={headCell}>Status</TableHead>
                                <TableHead className={`${headCell} hidden lg:table-cell`}>
                                    Requested
                                </TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((r) => {
                                const status = statusConfig[r.status];
                                const StatusIcon = status.icon;
                                const onSite = r.status === "Approved" && !r.checked_out_at;

                                return (
                                    <TableRow
                                        key={r.request_id}
                                        className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                                        {getInitials(fullName(r))}
                                                    </div>

                                                    {onSite && (
                                                        <span
                                                            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"
                                                            title="On site"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                                                        {fullName(r)}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-slate-800">
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
                                                    <IdCard className="h-3 w-3 shrink-0 text-slate-400" />
                                                    {r.id_type}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-300">No ID</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className={`${chip} ${status.className}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {r.status}
                                                </span>

                                                {r.checked_out_at && (
                                                    <span
                                                        className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}
                                                    >
                                                        Exited
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="hidden whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-800 lg:table-cell">
                                            {formatDateTime(r.created_at)}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-right">
                                            <Button
                                                size="sm"
                                                className={`h-7 gap-1.5 rounded-lg px-3 text-[11px] font-medium shadow-sm ${r.status === "Pending"
                                                    ? "bg-amber-800 text-white hover:bg-amber-900"
                                                    : "bg-white text-slate-600 shadow-none ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                                onClick={() => openDetail(r)}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                {r.status === "Pending" ? "Review" : "View"}
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
                                            {hasFilters ? "No matching requests" : "No visitor requests yet"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {hasFilters
                                                ? "Adjust your search or status filter to see more."
                                                : "Register a visitor to get started."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Detail modal — plain overlay, no Radix Dialog (backdrop-blur fix) */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Visitor request
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
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[13px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                                    {getInitials(fullName(selected))}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-[15px] font-semibold leading-none tracking-tight text-slate-900">
                                        {fullName(selected)}
                                    </p>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-[11px] tracking-tight text-slate-400">
                                            {selected.request_number}
                                        </span>

                                        <span className={`${chip} ${statusConfig[selected.status].className}`}>
                                            {selected.status}
                                        </span>

                                        {selected.checked_out_at && (
                                            <span className={`${chip} bg-slate-50 text-slate-500 ring-slate-200`}>
                                                Exited
                                            </span>
                                        )}
                                    </div>
                                </div>
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

                            {/* ID verification */}
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

                                {selected.checked_out_at && (
                                    <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600">
                                        <LogOut className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span>
                                            Exited{" "}
                                            <span className="tabular-nums">
                                                {formatDateTime(selected.checked_out_at)}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer actions */}
                        {selected.status === "Pending" && (
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
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verify &amp; approve
                                </Button>
                            </div>
                        )}

                        {selected.status === "Approved" && (
                            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
                                <Button
                                    variant="ghost"
                                    className="h-9 gap-1.5 rounded-xl text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                    onClick={() => setPassModalOpen(true)}
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    Print pass
                                </Button>

                                <Button
                                    className="h-9 gap-1.5 rounded-xl bg-amber-800 text-[12.5px] font-medium hover:bg-amber-900 disabled:bg-slate-100 disabled:text-slate-400"
                                    disabled={isLoading || !!selected.checked_out_at}
                                    onClick={handleRecordExit}
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    {selected.checked_out_at ? "Exit recorded" : "Record exit"}
                                </Button>
                            </div>
                        )}

                        {selected.status === "Rejected" && (
                            <div className="shrink-0 border-t border-slate-100 p-4">
                                <p className="text-center text-[11px] text-slate-400">
                                    This request has already been rejected.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            )}

            <RegisterVisitorModal
                open={registerModalOpen}
                onOpenChange={setRegisterModalOpen}
            />

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

            <VisitorPassModal
                open={passModalOpen}
                onOpenChange={setPassModalOpen}
                request={selected}
            />
        </div>
    );
}