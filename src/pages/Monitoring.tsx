import {
    CalendarDays,
    ClipboardList,
    Plus,
    ScrollText,
    Search,
    Shield,
    X,
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
import MonitoringStats from "@/components/Monitoring/MonitoringStats";
import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import AssignScheduleModal from "@/components/Monitoring/Assignschedulemodal";
import PatrolLogsPanel from "@/components/Monitoring/PatrolLogsPanel";
import { useState } from "react";

const triggerClass =
    "h-9 w-full rounded-xl border-0 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-40";

const itemClass = "text-[12.5px]";

export default function Monitoring() {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [view, setView] = useState<"schedules" | "logs">("schedules");
    const [search, setSearch] = useState("");

    const showLogs = view === "logs";

    return (
        <div className="space-y-2 p-4">

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-amber-800 shadow-sm">

                {/* Ambient wash */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-950/40 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                            <Shield className="h-5 w-5 text-amber-100" />
                        </div>

                        <div className="min-w-0">
                            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100 ring-1 ring-white/15">
                                Security Operations
                            </span>

                            <h1 className="mt-2 text-[18px] font-semibold tracking-tight text-white">
                                Monitoring &amp; Surveillance
                            </h1>

                            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-amber-100/70">
                                Assign schedules, supervise personnel, and oversee patrol
                                activity across campus.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <Button
                            onClick={() =>
                                setView(showLogs ? "schedules" : "logs")
                            }
                            variant="ghost"
                            className={`h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium ring-1 transition ${
                                showLogs
                                    ? "bg-white text-amber-900 ring-white hover:bg-amber-50"
                                    : "text-amber-100 ring-white/20 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <ScrollText className="h-3.5 w-3.5" />
                            {showLogs ? "Back to schedules" : "Patrol logs"}
                        </Button>

                        <Button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="h-9 gap-2 rounded-xl bg-white px-4 text-[12.5px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Assign schedule
                        </Button>

                    </div>

                </div>
            </div>

            {/* Statistics */}
            <MonitoringStats />

            {showLogs ? (
                <PatrolLogsPanel onBack={() => setView("schedules")} />
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">

                            <div className="relative w-full lg:max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                                <Input
                                    placeholder="Search security personnel"
                                    className="h-9 rounded-xl border-0 bg-slate-50 pl-9 pr-8 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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

                            <Select>
                                <SelectTrigger className={triggerClass}>
                                    <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Date" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="today" className={itemClass}>Today</SelectItem>
                                    <SelectItem value="week" className={itemClass}>This week</SelectItem>
                                    <SelectItem value="month" className={itemClass}>This month</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select>
                                <SelectTrigger className={triggerClass}>
                                    <ClipboardList className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="Pending" className={itemClass}>Pending</SelectItem>
                                    <SelectItem value="Ongoing" className={itemClass}>Ongoing</SelectItem>
                                    <SelectItem value="Completed" className={itemClass}>Completed</SelectItem>
                                    <SelectItem value="Cancelled" className={itemClass}>Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                    </div>

                    {/* Table */}
                    <MonitoringTable />
                </>
            )}

            <AssignScheduleModal
                open={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
            />

        </div>
    );
}