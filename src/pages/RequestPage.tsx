import { useCallback, useMemo, useState } from "react";
import {
    Search,
    Plus,
    IdCard,
    Clock,
    CheckCircle2,
    XCircle,
    X,
    Eye,
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
import VisitorPassModal from "@/components/Request/VisitorPassModal";
import VisitorRequestDetailModal from "@/components/Request/VisitorRequestDetailModal";
import { useRequest } from "@/hooks/useRequest";
import { useToast } from "@/hooks/useToast";

import PageHeader, { HEADER_PRIMARY_BUTTON } from "@/components/layout/PageHeader";
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
    const [passModalOpen, setPassModalOpen] = useState(false);
    const { myRequests, checkOutVisitor, isLoading } =
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

    const closeDetail = useCallback(() => setSelected(null), []);

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
            <PageHeader
                eyebrow="Visitor & access control"
                title="Visitor Access Requests"
                description="Register visitors, verify identity against uploaded ID, issue passes, and record entry and exit times."
                actions={
                    <Button
                        onClick={() => setRegisterModalOpen(true)}
                        className={HEADER_PRIMARY_BUTTON}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Register visitor entry
                    </Button>
                }
            />

            {/* Toolbar + Table */}
            <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white ring-0">

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

            <VisitorRequestDetailModal
                request={selected}
                onClose={closeDetail}
                onPrintPass={() => setPassModalOpen(true)}
                onRecordExit={handleRecordExit}
                isLoading={isLoading}
            />

            <RegisterVisitorModal
                open={registerModalOpen}
                onOpenChange={setRegisterModalOpen}
            />

            <VisitorPassModal
                open={passModalOpen}
                onOpenChange={setPassModalOpen}
                request={selected}
            />
        </div>
    );
}