import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    UserX,
    ShieldOff,
    Calendar,
    User,
    X,
    RotateCcw,
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
import AddBlacklistModal from "@/components/Blacklist/AddBlacklistModal";
import RemoveBlacklistDialog from "@/components/Blacklist/RemoveBlacklistDialog";
import { useBlacklist } from "@/hooks/useBlacklist";
import { useToast } from "@/hooks/useToast";
import type { BlacklistEntry } from "@/store/useBlacklistStore";

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

function fullName(entry: BlacklistEntry) {
    return [entry.first_name, entry.middle_name, entry.last_name]
        .filter(Boolean)
        .join(" ");
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function VisitorBlacklistPage() {
    const [search, setSearch] = useState("");
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [selected, setSelected] = useState<BlacklistEntry | null>(null);
    const { blacklist, isLoading, removeFromBlacklist } = useBlacklist();
    const { showToast } = useToast();

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === "") return blacklist;

        return blacklist.filter(
            (entry) =>
                fullName(entry).toLowerCase().includes(query) ||
                entry.reason.toLowerCase().includes(query)
        );
    }, [blacklist, search]);

    const handleRemove = async () => {
        if (!selected) return;

        const success = await removeFromBlacklist(selected.blacklist_id);

        if (success) {
            showToast(
                "success",
                "Visitor Restored",
                `${fullName(selected)} has been removed from the blacklist.`
            );
        } else {
            showToast("error", "Action Failed", "Unable to update the blacklist.");
        }

        setRemoveDialogOpen(false);
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
                            <ShieldOff className="h-3 w-3" />
                            Visitor &amp; Access Control
                        </span>

                        <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                            Visitor Blacklist
                        </h1>

                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                            Anyone on this list is blocked from registering for campus
                            access. Remove them once the restriction no longer applies.
                        </p>
                    </div>

                    <Button
                        onClick={() => setAddModalOpen(true)}
                        className="h-9 shrink-0 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Blacklist visitor
                    </Button>

                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            placeholder="Search name or reason"
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

                    <span className={`${chip} bg-red-50 text-red-700 ring-red-100`}>
                        <ShieldOff className="h-3 w-3" />
                        {blacklist.length} blacklisted
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
                                    Reason
                                </TableHead>
                                <TableHead className={`${headCell} hidden sm:table-cell`}>
                                    Blacklisted By
                                </TableHead>
                                <TableHead className={`${headCell} hidden lg:table-cell`}>
                                    Date
                                </TableHead>
                                <TableHead className={`${headCell} px-5 text-right`}>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((entry) => (
                                <TableRow
                                    key={entry.blacklist_id}
                                    className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                                                {getInitials(fullName(entry))}
                                            </div>

                                            <p className="truncate text-[13px] font-medium text-slate-900">
                                                {fullName(entry)}
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell className="hidden max-w-70 truncate py-3 text-[12.5px] text-slate-600 md:table-cell">
                                        {entry.reason}
                                    </TableCell>

                                    <TableCell className="hidden py-3 sm:table-cell">
                                        {entry.blacklisted_by_name ? (
                                            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-600">
                                                <User className="h-3 w-3 shrink-0 text-slate-400" />
                                                {entry.blacklisted_by_name}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-slate-300">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="hidden py-3 lg:table-cell">
                                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] tabular-nums text-slate-400">
                                            <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                                            {formatDate(entry.created_at)}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-5 py-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-50 hover:text-emerald-800"
                                            onClick={() => {
                                                setSelected(entry);
                                                setRemoveDialogOpen(true);
                                            }}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Restore access
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!isLoading && filtered.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-16 text-center">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                            <UserX className="h-5 w-5 text-slate-400" />
                                        </div>

                                        <p className="mt-3 text-[13px] font-medium text-slate-700">
                                            {search.trim()
                                                ? "No matching entries"
                                                : "No blacklisted visitors"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {search.trim()
                                                ? "Adjust your search to see more."
                                                : "Visitors you blacklist will appear here."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddBlacklistModal open={addModalOpen} onOpenChange={setAddModalOpen} />

            <RemoveBlacklistDialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                visitorName={selected ? fullName(selected) : undefined}
                isLoading={isLoading}
                onConfirm={handleRemove}
            />
        </div>
    );
}