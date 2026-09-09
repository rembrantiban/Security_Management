import { useState } from "react";

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

import { CheckCircle2, ClipboardCheck } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import type { MonitoringSchedule } from "@/store/useMonitoringStore";

interface Props {
    open: boolean;
    onClose: () => void;
    onComplete: (observations: string) => void;
    loading: boolean;
    schedule: MonitoringSchedule | null;
}

export default function CompletePatrolModal({
    open,
    onClose,
    onComplete,
    loading,
    schedule,
}: Props) {
    const [observations, setObservations] = useState("");

    if (!schedule) return null;

    const handleClose = () => {
        setObservations("");
        onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="sm:max-w-md gap-4 rounded-2xl">

                <AlertDialogHeader className="items-center text-center">
                    <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                        <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                    </div>

                    <AlertDialogTitle className="text-[15px] font-semibold">
                        Complete Patrol
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-[12.5px] leading-relaxed">
                        Record your findings for{" "}
                        <span className="font-medium text-slate-700">
                            {schedule.assigned_area}
                        </span>{" "}
                        before ending this patrol.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-1.5">
                    <label className="text-[12.5px] font-medium text-slate-700">
                        Observations{" "}
                        <span className="font-normal text-slate-400">(optional)</span>
                    </label>

                    <Textarea
                        placeholder="Anything notable — incidents, hazards, or that the area was clear…"
                        rows={3}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="resize-none rounded-xl text-[12.5px]"
                    />
                </div>

                <div className="flex gap-2.5 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

                    <div className="space-y-1 text-[12px] text-slate-600">
                        <p className="font-medium text-slate-700">
                            When you complete this patrol
                        </p>
                        <ul className="space-y-0.5">
                            <li>
                                Monitoring schedule becomes{" "}
                                <span className="font-medium text-slate-700">
                                    Completed
                                </span>
                            </li>
                            <li>This log is added to your patrol reports</li>
                        </ul>
                    </div>
                </div>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="h-9 rounded-xl text-[12.5px]">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => onComplete(observations)}
                        disabled={loading}
                        className="h-9 gap-1.5 rounded-xl bg-emerald-700 text-[12.5px] hover:bg-emerald-800"
                    >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {loading ? "Completing…" : "Complete Patrol"}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
