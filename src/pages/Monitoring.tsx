import {
    CalendarDays,
    ClipboardList,
    Plus,
    Search,
    Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
//import MonitoringStats from "@/components/Monitoring/MonitoringStats";
import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import AssignScheduleModal from "@/components/Monitoring/Assignschedulemodal";
import { useState } from "react";


export default function Monitoring() {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    return (
        <div className="relative space-y-2 py-4">

            {/* Header */}
            <div className="relative overflow-hidden rounded border border-orange-100 bg-white shadow-sm">

                <div className="absolute inset-0 bg-linear-to-r from-orange-50 via-white to-orange-100" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-4">

                    <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 shadow-sm">
                            <Shield className="h-7 w-7 text-orange-700" />
                        </div>

                        <div>

                            <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                                Security Operations
                            </div>

                            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                                Monitoring & Surveillance
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Assign monitoring schedules, supervise security personnel,
                                and oversee patrol activities across the campus from one
                                centralized dashboard.
                            </p>

                        </div>

                    </div>

                    <Button
                        onClick={() => setIsAssignModalOpen(true)}
                        size="lg"
                        className="rounded-xl bg-orange-700 hover:bg-orange-800 shadow-md"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Schedule
                    </Button>

                </div>

            </div>

            {/* Statistics */}
            {/* <MonitoringStats /> */}
            {/* Toolbar */}
            <Card className="rounded border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-3">

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search security personnel..."
                                className="pl-10 rounded-xl max-w-sm border-slate-200 focus-visible:ring-orange-200 focus-visible:ring-2"
                            />
                        </div>

                        <Select>
                            <SelectTrigger className="w-full lg:w-45 rounded-xl border-slate-200">
                                <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger className="w-full lg:w-45 rounded-xl border-slate-200">
                                <ClipboardList className="mr-2 h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <MonitoringTable />
            <AssignScheduleModal open={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />

        </div>
    );
}