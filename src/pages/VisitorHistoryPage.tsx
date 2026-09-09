import { useMemo, useState } from "react";
import {
    Search,
    History,
    Clock,
    CheckCircle2,
    XCircle,
    LogOut,
    Eye,
    X,
    IdCard,
    User,
    Building2,
    UserX,
    MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AddBlacklistModal from "@/components/Blacklist/AddBlacklistModal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRequest } from "@/hooks/useRequest";
import type { RequestAccess } from "@/store/useRequestStore";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ring-1 whitespace-nowrap";

const statusConfig = {
    Pending: { className: "bg-amber-50 text-amber-800 ring-amber-100", icon: Clock },
    Approved: { className: "bg-emerald-50 text-emerald-700 ring-emerald-100", icon: CheckCircle2 },
    Rejected: { className: "bg-red-50 text-red-700 ring-red-100", icon: XCircle },
};

const historyFilters = ["All", "On Campus", "Exited", "Rejected"] as const;
type HistoryFilter = (typeof historyFilters)[number];

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

export default function VisitorHistoryPage() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<HistoryFilter>("All");
    const [selected, setSelected] = useState<RequestAccess | null>(null);
    const [blacklistTarget, setBlacklistTarget] = useState<RequestAccess | null>(null);
    const { requests } = useRequest();

    const onCampusCount = useMemo(
        () => requests.filter((r) => r.status === "Approved" && !r.checked_out_at).length,
        [requests]
    );
    const exitedCount = useMemo(
        () => requests.filter((r) => r.status === "Approved" && r.checked_out_at).length,
        [requests]
    );
    const rejectedCount = useMemo(
        () => requests.filter((r) => r.status === "Rejected").length,
        [requests]
    );

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchesFilter =
                filter === "All" ||
                (filter === "On Campus" && r.status === "Approved" && !r.checked_out_at) ||
                (filter === "Exited" && r.status === "Approved" && !!r.checked_out_at) ||
                (filter === "Rejected" && r.status === "Rejected");

            const query = search.trim().toLowerCase();
            const matchesSearch =
                query === "" ||
                fullName(r).toLowerCase().includes(query) ||
                r.request_number.toLowerCase().includes(query) ||
                r.purpose.toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [requests, search, filter]);

    const hasFilters = search.trim() !== "" || filter !== "All";

    return (
        <div className="space-y-2">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                {/* Ambient wash */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-amber-100 ring-1 ring-white/15">
                            <History className="h-3 w-3" />
                            Visitor &amp; Access Control
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            Visitor History
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            A searchable record of every request — entry, exit, and outcome —
                            for audit and compliance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatCard
                    icon={User}
                    label="On Campus"
                    value={onCampusCount}
                    tone="blue"
                    hint="Approved, not yet exited"
                />
                <StatCard
                    icon={LogOut}
                    label="Exited"
                    value={exitedCount}
                    tone="emerald"
                    hint="Checked out of campus"
                />
                <StatCard
                    icon={XCircle}
                    label="Rejected"
                    value={rejectedCount}
                    tone="red"
                    hint="Denied access requests"
                />
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            placeholder="Search name, request number, or purpose"
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

                    {/* Segmented filter */}
                    <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-200">
                        {historyFilters.map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${filter === f
                                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

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
                                <TableHead className={headCell}>Status</TableHead>
                                <TableHead className={`${headCell} hidden lg:table-cell`}>
                                    Entry
                                </TableHead>
                                <TableHead className={`${headCell} hidden lg:table-cell`}>
                                    Exit
                                </TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((r) => {
                                const status = statusConfig[r.status];
                                const StatusIcon = status.icon;
                                const onCampus = r.status === "Approved" && !r.checked_out_at;

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

                                                    {onCampus && (
                                                        <span
                                                            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"
                                                            title="On campus"
                                                        />
                                                    )}
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

                                        <TableCell className="hidden max-w-55 truncate py-3 text-[12.5px] text-slate-700 md:table-cell">
                                            {r.purpose}
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

                                        <TableCell className="hidden whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-700 lg:table-cell">
                                            {formatDateTime(r.approved_at ?? r.created_at)}
                                        </TableCell>

                                        <TableCell className="hidden whitespace-nowrap py-3 text-[11px] tabular-nums text-slate-700 lg:table-cell">
                                            {r.checked_out_at ? (
                                                formatDateTime(r.checked_out_at)
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <button
                                                        type="button"
                                                        aria-label="Row actions"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem
                                                        onClick={() => setSelected(r)}
                                                        className="gap-2.5 text-[13px] text-slate-700"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => setBlacklistTarget(r)}
                                                        className="gap-2.5 text-[13px]"
                                                    >
                                                        <UserX className="h-3.5 w-3.5" />
                                                        Blacklist visitor
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filtered.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6} className="py-16 text-center">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                                            <History className="h-5 w-5 text-amber-800" />
                                        </div>

                                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                                            {hasFilters ? "No matching records" : "No visitor records yet"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {hasFilters
                                                ? "Adjust your search or filter to see more."
                                                : "Records appear here once visitors are processed."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelected(null)}
                    />

                    <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Visitor record
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

                            <div className="mt-5">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                    Purpose of visit
                                </p>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                                    {selected.purpose}
                                </p>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="flex items-center gap-2 text-[12.5px] text-slate-700">
                                    <IdCard className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span>{selected.id_type ?? "No ID type on file"}</span>
                                </div>

                                {selected.id_image && (
                                    <img
                                        src={selected.id_image}
                                        alt="Visitor ID"
                                        className="mt-2.5 max-h-40 w-full rounded-lg object-contain"
                                    />
                                )}
                            </div>

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
                                    <span>
                                        Entered{" "}
                                        <span className="tabular-nums">
                                            {formatDateTime(selected.approved_at ?? selected.created_at)}
                                        </span>
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

                        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                            <Button
                                variant="ghost"
                                className="h-8 rounded-lg px-3 text-[12px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </Button>
                            <Button
                                className="h-8 gap-1.5 rounded-lg bg-red-600 px-3 text-[12px] font-medium text-white shadow-sm hover:bg-red-700"
                                onClick={() => setBlacklistTarget(selected)}
                            >
                                <UserX className="h-3.5 w-3.5" />
                                Blacklist visitor
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <AddBlacklistModal
                open={!!blacklistTarget}
                onOpenChange={(open) => {
                    if (!open) setBlacklistTarget(null);
                }}
                initialName={
                    blacklistTarget
                        ? {
                              first_name: blacklistTarget.first_name,
                              middle_name: blacklistTarget.middle_name,
                              last_name: blacklistTarget.last_name,
                          }
                        : undefined
                }
            />
        </div>
    );
}

const statTones = {
    blue: { icon: "bg-blue-50 text-blue-600 ring-blue-100" },
    emerald: { icon: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    red: { icon: "bg-red-50 text-red-600 ring-red-100" },
} as const;

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
    hint,
}: {
    icon: typeof User;
    label: string;
    value: number;
    tone: keyof typeof statTones;
    hint?: string;
}) {
    const t = statTones[tone];

    return (
        <div className="rounded-2xl bg-white/50 px-8 py-2 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300">
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-800">
                    {label}
                </p>

                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${t.icon}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                {value}
            </p>

            {hint && <p className="mt-2 truncate text-[11px] text-slate-800">{hint}</p>}
        </div>
    );
}