import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { BadgeCheck, Play, Shield } from "lucide-react";

import type { MonitoringSchedule } from "@/store/useMonitoringStore";

interface Props {
    open: boolean;
    onClose: () => void;
    onStart: () => void;
    loading: boolean;
    schedule: MonitoringSchedule | null;
}

export default function StartPatrolModal({
    open,
    onClose,
    onStart,
    loading,
    schedule,
}: Props) {
    if (!schedule) return null;

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-md gap-4 rounded-2xl">

                <AlertDialogHeader className="items-center text-center">
                    <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-100">
                        <Shield className="h-5 w-5 text-orange-700" />
                    </div>

                    <AlertDialogTitle className="text-[15px] font-semibold">
                        Record Patrol
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-[12.5px] leading-relaxed">
                        You are about to begin your assigned patrol at{" "}
                        <span className="font-medium text-slate-700">
                            {schedule.assigned_area}
                        </span>
                        .
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex gap-2.5 rounded-xl bg-orange-50 p-3 ring-1 ring-orange-100">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />

                    <div className="space-y-1 text-[12px] text-slate-600">
                        <p className="font-medium text-slate-700">
                            When you record this patrol
                        </p>
                        <ul className="space-y-0.5">
                            <li>
                                Monitoring schedule becomes{" "}
                                <span className="font-medium text-slate-700">
                                    Ongoing
                                </span>
                            </li>
                            <li>Checkpoints and timing start logging</li>
                        </ul>
                    </div>
                </div>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="h-9 rounded-xl text-[12.5px]">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onStart}
                        disabled={loading}
                        className="h-9 gap-1.5 rounded-xl bg-orange-700 text-[12.5px] hover:bg-orange-800"
                    >
                        <Play className="h-3.5 w-3.5" />
                        {loading ? "Recording…" : "Record Patrol"}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
