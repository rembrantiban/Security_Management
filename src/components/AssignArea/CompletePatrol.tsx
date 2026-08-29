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

import {
    CheckCircle2,
    ClipboardCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <AlertDialog
            open={open}
            onOpenChange={handleClose}
        >
            <AlertDialogContent className="sm:max-w-md rounded-2xl">

                <AlertDialogHeader className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <ClipboardCheck className="h-8 w-8 text-emerald-700" />
                    </div>

                    <AlertDialogTitle className="text-xl">
                        Complete Patrol
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-center">
                        Record your findings for{" "}
                        <span className="font-medium text-slate-700">
                            {schedule.assigned_area}
                        </span>{" "}
                        before ending this patrol.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Observations{" "}
                        <span className="font-normal text-slate-400">
                            (optional)
                        </span>
                    </label>

                    <Textarea
                        placeholder="Describe anything notable during this patrol — incidents, hazards, or that everything was clear..."
                        rows={4}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="rounded-xl"
                    />
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                    <div className="flex gap-3">

                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />

                        <div className="space-y-1 text-sm text-slate-700">

                            <p className="font-medium">
                                Once you complete patrol:
                            </p>

                            <ul className="space-y-1 text-slate-600">
                                <li>• Your duty status becomes <b>Off Duty</b></li>
                                <li>• Monitoring schedule becomes <b>Completed</b></li>
                                <li>• This log is added to your patrol reports</li>
                            </ul>

                        </div>

                    </div>

                </div>

                <AlertDialogFooter>

                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction>

                        <Button
                            onClick={() => onComplete(observations)}
                            disabled={loading}
                            className="bg-emerald-700 hover:bg-emerald-800"
                        >
                            <ClipboardCheck className="mr-2 h-4 w-4" />

                            {loading
                                ? "Completing..."
                                : "Complete Patrol"}
                        </Button>

                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
