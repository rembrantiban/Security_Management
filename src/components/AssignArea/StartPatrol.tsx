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
    BadgeCheck,
    Play,
    Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <AlertDialog
            open={open}
            onOpenChange={onClose}
        >
            <AlertDialogContent className="sm:max-w-md rounded-2xl">

                <AlertDialogHeader className=" flex flex-col justify-center max-w-full items-center">
                    <div className="relative left-10 ">
                        <div className="flex flex-col items-center">
                             <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Shield className="h-8 w-8 text-orange-700" />
                        </div>
                            <AlertDialogTitle className="text-xl">
                                Start Patrol
                            </AlertDialogTitle>

                            <AlertDialogDescription className="text-center">
                                You are about to begin your assigned patrol duty.
                            </AlertDialogDescription>
                        </div>

                    </div>

                </AlertDialogHeader>


                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <div className="flex gap-3">

                        <BadgeCheck className="mt-0.5 h-5 w-5 text-orange-700" />

                        <div className="space-y-1 text-sm text-slate-700">

                            <p className="font-medium">
                                Once you start patrol:
                            </p>

                            <ul className="space-y-1 text-slate-600">
                                <li>• Your duty status becomes <b>On Duty</b></li>
                                <li>• Monitoring schedule becomes <b>Ongoing</b></li>
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
                            onClick={onStart}
                            disabled={loading}
                            className="bg-orange-700 hover:bg-orange-800"
                        >
                            <Play className="mr-2 h-4 w-4" />

                            {loading
                                ? "Starting..."
                                : "Start Patrol"}
                        </Button>

                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}