import { useState } from "react";
import {
    Clock3,
    CalendarClock,
    Shield,
    Save,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";


import type { Users } from "@/store/useAuthStore";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    personnel: Users | null;
    onSave: (
        dutyStart: string,
        dutyEnd: string
    ) => Promise<void>;
};

export default function SetDutyScheduleDialog({
    open,
    onOpenChange,
    personnel,
    onSave,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [dutyStart, setDutyStart] = useState(personnel?.duty_start?.slice(0, 5) ?? "");

    const [dutyEnd, setDutyEnd] = useState(personnel?.duty_end?.slice(0, 5) ?? "");
    const { showToast } = useToast();
    if (!personnel) return null;


const handleSave = async () => {
    setLoading(true);

    try {
        await onSave(dutyStart, dutyEnd);

        showToast(
            "success",
            "Duty Schedule Updated",
            "The duty schedule has been updated successfully."
        );

        setDutyStart("");
        setDutyEnd("");
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;

        showToast(
            "error",
            "Failed to Update Duty Schedule",
            err.response?.data?.message ??
                "An error occurred while updating the duty schedule."
        );
    } finally {
        setLoading(false);
        onOpenChange(false);
    }
};

    const formatTime = (time: string) => {
        if (!time) return "--:--";

        const [hour, minute] = time.split(":").map(Number);

        return new Date(0, 0, 0, hour, minute).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-lg rounded">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-950">
                        <CalendarClock className="h-5 w-5 text-orange-600" />
                        Set Duty Schedule
                    </DialogTitle>

                    <DialogDescription>
                        Assign the working schedule for this security personnel.
                    </DialogDescription>
                </DialogHeader>

                {/* Personnel Card */}

                <div className="flex items-center gap-4 rounded-xl border bg-orange-50/60 p-4">

                    <Avatar className="h-12 w-12 border">
                        <AvatarFallback className="bg-orange-900 text-white">
                            {personnel.first_name[0]}
                            {personnel.last_name[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="font-semibold text-slate-900">
                            {personnel.first_name} {personnel.last_name}
                        </h3>

                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Security Personnel
                        </p>
                    </div>

                </div>

                {/* Schedule */}

                <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">
                        <Label>
                            Duty Start
                        </Label>

                        <div className="relative">

                            <Clock3 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                type="time"
                                value={dutyStart}
                                onChange={(e) =>
                                    setDutyStart(
                                        e.target.value
                                    )
                                }
                                className="pl-10 rounded-xl"
                            />

                        </div>

                    </div>

                    <div className="space-y-2">

                        <Label>
                            Duty End
                        </Label>

                        <div className="relative">

                            <Clock3 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                type="time"
                                value={dutyEnd}
                                onChange={(e) =>
                                    setDutyEnd(
                                        e.target.value
                                    )
                                }
                                className="pl-10 rounded-xl"
                            />

                        </div>

                    </div>

                </div>

                {/* Preview */}

                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">

                    <p className="text-sm font-medium text-orange-900">
                        Schedule Preview
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                        {formatTime(dutyStart || "--:--")} → {formatTime(dutyEnd || "--:--")}
                    </p>
                </div>

                <DialogFooter>

                    <Button
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={
                            loading ||
                            !dutyStart ||
                            !dutyEnd
                        }
                        className="rounded-xl bg-orange-950 hover:bg-orange-900"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {loading
                            ? "Saving..."
                            : "Save Schedule"}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}