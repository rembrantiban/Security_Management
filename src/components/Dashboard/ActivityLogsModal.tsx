import { useEffect, useMemo, useState } from "react";
import {
    History,
    LogIn,
    LogOut,
    UserPlus,
    IdCard,
    ShieldCheck,
    CalendarClock,
    Route,
    TriangleAlert,
    Search,
    SearchX,
    X,
    Loader2,
    type LucideIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    useActivityStore,
    type ActivityLog,
    type ActivityAction,
} from "@/store/useActivityStore";

type ActivityLogsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

export const actionConfig: Record<
    ActivityAction,
    { icon: LucideIcon; tile: string; chip: string }
> = {
    Login: {
        icon: LogIn,
        tile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    Logout: {
        icon: LogOut,
        tile: "bg-slate-50 text-slate-500 ring-slate-200",
        chip: "bg-slate-50 text-slate-500 ring-slate-200",
    },
    Register: {
        icon: UserPlus,
        tile: "bg-sky-50 text-sky-600 ring-sky-100",
        chip: "bg-sky-50 text-sky-700 ring-sky-100",
    },
    "Incident Report": {
        icon: TriangleAlert,
        tile: "bg-red-50 text-red-600 ring-red-100",
        chip: "bg-red-50 text-red-700 ring-red-100",
    },
    "Visitor Request": {
        icon: IdCard,
        tile: "bg-amber-50 text-amber-700 ring-amber-100",
        chip: "bg-amber-50 text-amber-800 ring-amber-100",
    },
    "Access Request": {
        icon: ShieldCheck,
        tile: "bg-violet-50 text-violet-600 ring-violet-100",
        chip: "bg-violet-50 text-violet-700 ring-violet-100",
    },
    Monitoring: {
        icon: CalendarClock,
        tile: "bg-indigo-50 text-indigo-600 ring-indigo-100",
        chip: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
    Patrol: {
        icon: Route,
        tile: "bg-teal-50 text-teal-600 ring-teal-100",
        chip: "bg-teal-50 text-teal-700 ring-teal-100",
    },
};

const fallbackConfig = {
    icon: History,
    tile: "bg-slate-50 text-slate-500 ring-slate-200",
    chip: "bg-slate-50 text-slate-500 ring-slate-200",
};

/**
 * Human-readable predicate for a log entry — the part that follows the actor,
 * e.g. "logged in", "reported incident #INC-2026-0001".
 *
 * `detail` carries a ready-made predicate for the multi-variant actions
 * (Monitoring / Patrol / Access Request); the simpler actions are phrased here.
 */
export function describeActivity(log: ActivityLog): string {
    const ref = log.reference ? `#${log.reference}` : "";

    switch (log.action) {
        case "Login":
            return "logged in";
        case "Logout":
            return "logged out";
        case "Register":
            return log.detail
                ? `registered a new ${log.detail}`
                : "registered a new account";
        case "Incident Report":
            return (
                `reported incident ${ref}`.trim() +
                (log.detail ? ` — ${log.detail}` : "")
            );
        case "Visitor Request":
            return (
                `submitted access request ${ref}`.trim() +
                (log.detail ? ` for ${log.detail}` : "")
            );
        case "Access Request":
            return `${log.detail ?? "updated"} access request ${ref}`.trim();
        case "Monitoring":
        case "Patrol":
            return log.detail ?? log.action.toLowerCase();
        default:
            return log.detail ?? log.action;
    }
}

/** Full sentence for a log entry, e.g. "John Doe logged in". */
export function activitySentence(log: ActivityLog): string {
    return `${log.user_name} ${describeActivity(log)}`;
}

export function formatDateTime(value: string): string {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function ActivityLogsModal({
    open,
    onOpenChange,
}: ActivityLogsModalProps) {
    const { logs, isLoading, getActivityLogs } = useActivityStore();
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) getActivityLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return logs;

        return logs.filter(
            (log) =>
                activitySentence(log).toLowerCase().includes(query) ||
                (log.role ?? "").toLowerCase().includes(query)
        );
    }, [logs, search]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-3xl rounded-2xl p-0 gap-0 overflow-hidden ring-1 ring-slate-200"
            >
                {/* Header */}
                <DialogHeader className="gap-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                            <History className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-[14px] font-semibold tracking-tight text-slate-900">
                                Activity Logs
                            </DialogTitle>
                            <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                                Every recorded system activity, newest first.
                            </p>
                        </div>

                        <span className="ml-auto shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">
                            {filtered.length}
                        </span>
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="border-b border-slate-100 px-5 py-3.5">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search activity or role"
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
                </div>

                {/* Body */}
                <div className="max-h-[55vh] overflow-y-auto">
                    {isLoading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            <p className="text-[12px] text-slate-500">Loading logs…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                {logs.length === 0 ? (
                                    <History className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <SearchX className="h-5 w-5 text-slate-400" />
                                )}
                            </div>
                            <p className="mt-3 text-[13px] font-medium text-slate-700">
                                {logs.length === 0
                                    ? "No activity recorded yet"
                                    : "No logs match your search"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                {logs.length === 0
                                    ? "System activity will appear here."
                                    : "Try a different name, role, or action."}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead className={`${headCell} px-5`}>Activity</TableHead>
                                    <TableHead className={headCell}>Role</TableHead>
                                    <TableHead className={`${headCell} px-5`}>When</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.map((log) => {
                                    const cfg =
                                        actionConfig[log.action] ?? fallbackConfig;
                                    const Icon = cfg.icon;

                                    return (
                                        <TableRow
                                            key={log.activity_id}
                                            className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${cfg.tile}`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-[12.5px] text-slate-700">
                                                        <span className="font-medium text-slate-900">
                                                            {log.user_name}
                                                        </span>{" "}
                                                        {describeActivity(log)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3">
                                                <span className="text-[12px] text-slate-600">
                                                    {log.role ?? "—"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-5 py-3">
                                                <span className="whitespace-nowrap text-[11px] tabular-nums text-slate-500">
                                                    {formatDateTime(log.created_at)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
