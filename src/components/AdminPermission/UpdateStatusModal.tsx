import { useState } from "react";
import { RefreshCw, AlertCircle, Clock, Loader2, CheckCircle2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";

const statusOptions: {
    value: IncidentStatus;
    label: string;
    icon: typeof AlertCircle;
    activeClass: string;
}[] = [
    {
        value: "Open",
        label: "Open",
        icon: AlertCircle,
        activeClass: "border-red-300 bg-red-50 text-red-700",
    },
    {
        value: "In Progress",
        label: "In Progress",
        icon: Loader2,
        activeClass: "border-blue-300 bg-blue-50 text-blue-700",
    },
    {
        value: "Resolved",
        label: "Resolved",
        icon: CheckCircle2,
        activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
    },
    {
        value: "Closed",
        label: "Closed",
        icon: Lock,
        activeClass: "border-slate-300 bg-slate-100 text-slate-700",
    },
];

type UpdateStatusModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: {
        reference: string;
        title: string;
        status: IncidentStatus;
    } | null;
    onUpdate: (newStatus: IncidentStatus, note: string) => void;
};

export default function UpdateStatusModal({
    open,
    onOpenChange,
    incident,
    onUpdate,
}: UpdateStatusModalProps) {
    const [selected, setSelected] = useState<IncidentStatus | null>(null);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!incident) return null;

    const currentStatus = incident.status;
    const targetStatus = selected ?? currentStatus;

    const handleUpdate = async () => {
        if (!selected || selected === currentStatus) return;
        setSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        onUpdate(selected, note);
        setSubmitting(false);
        setSelected(null);
        setNote("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-950">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        Update Incident Status
                    </DialogTitle>
                    <DialogDescription>
                        {incident.reference} &middot; {incident.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>New status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;
                                const isCurrent = option.value === currentStatus;
                                const isSelected = targetStatus === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelected(option.value)}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                                            isSelected
                                                ? option.activeClass
                                                : "border-gray-200 text-slate-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {option.label}
                                        {isCurrent && (
                                            <span className="ml-auto text-[10px] font-normal text-slate-400">
                                                current
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status update note</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe what changed, e.g. site secured, awaiting witness statement..."
                            className="min-h-20 resize-none rounded-xl"
                        />
                    </div>

                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            This change will be recorded in the incident timeline with your
                            name and the current time.
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!selected || selected === currentStatus || submitting}
                        onClick={handleUpdate}
                        className="rounded-xl bg-orange-950 text-white hover:bg-orange-900"
                    >
                        {submitting ? "Updating..." : "Save Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}