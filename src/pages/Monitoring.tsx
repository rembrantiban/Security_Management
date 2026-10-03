import {
    CalendarDays,
    ClipboardList,
    Plus,
    ScrollText,
    Search,
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

import PageHeader, { HEADER_PRIMARY_BUTTON, HEADER_SECONDARY_BUTTON, HEADER_TOGGLE_ACTIVE_BUTTON } from "@/components/layout/PageHeader";
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
            <PageHeader
                eyebrow="Security operations"
                title="Monitoring & Surveillance"
                description="Assign schedules, supervise personnel, and oversee patrol activity across campus."
                actions={
                    <>
                        <Button
                            onClick={() =>
                                setView(showLogs ? "schedules" : "logs")
                            }
                            variant="ghost"
                            className={showLogs ? HEADER_TOGGLE_ACTIVE_BUTTON : HEADER_SECONDARY_BUTTON}
                        >
                            <ScrollText className="h-3.5 w-3.5" />
                            {showLogs ? "Back to schedules" : "Patrol logs"}
                        </Button>

                        <Button
                            onClick={() => setIsAssignModalOpen(true)}
                            className={HEADER_PRIMARY_BUTTON}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Assign schedule
                        </Button>
                    </>
                }
            />

            {/* Statistics */}
            <MonitoringStats />

            {showLogs ? (
                <PatrolLogsPanel onBack={() => setView("schedules")} />
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-3 ring-0">
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