import { useState } from "react";
import { UserPlus, Siren, ShieldAlert, AlertTriangle } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type IncidentSeverity = "Critical" | "High" | "Moderate" | "Low";

type PersonnelType = {
    id: number;
    name: string;
    role: string;
    status: "Available" | "On Duty" | "Off Duty";
    open_cases: number;
};

const personnel: PersonnelType[] = [
    { id: 1, name: "Mark Reyes", role: "Security Guard", status: "Available", open_cases: 1 },
    { id: 2, name: "Anna Cruz", role: "Security Guard", status: "Available", open_cases: 0 },
    { id: 3, name: "Pedro Bautista", role: "Senior Guard", status: "On Duty", open_cases: 3 },
    { id: 4, name: "Liza Domingo", role: "Security Guard", status: "Off Duty", open_cases: 0 },
];

const severityIcon: Record<IncidentSeverity, typeof Siren> = {
    Critical: Siren,
    High: ShieldAlert,
    Moderate: AlertTriangle,
    Low: AlertTriangle,
};

const statusDotClass: Record<PersonnelType["status"], string> = {
    Available: "bg-emerald-500",
    "On Duty": "bg-blue-500",
    "Off Duty": "bg-slate-300",
};

type AssignIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: {
        reference: string;
        title: string;
        severity: IncidentSeverity;
        assigned_to: string | null;
    } | null;
    onAssign: (personnelName: string, note: string) => void;
};

export default function AssignIncidentModal({
    open,
    onOpenChange,
    incident,
    onAssign,
}: AssignIncidentModalProps) {
    const [selectedId, setSelectedId] = useState<string>("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!incident) return null;

    const SeverityIcon = severityIcon[incident.severity];
    const selectedPerson = personnel.find((p) => String(p.id) === selectedId);

    const handleAssign = async () => {
        if (!selectedPerson) return;
        setSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        onAssign(selectedPerson.name, note);
        setSubmitting(false);
        setSelectedId("");
        setNote("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl rounded">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-950">
                        <UserPlus className="h-5 w-5 text-orange-600" />
                        {incident.assigned_to ? "Reassign Personnel" : "Assign Personnel"}
                    </DialogTitle>
                    <DialogDescription>
                        Choose the security personnel who will handle this incident.
                    </DialogDescription>
                </DialogHeader>

                {/* Incident summary */}
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-slate-50/60 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-900 to-orange-600 text-white">
                        <SeverityIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {incident.title}
                        </p>
                        <p className="text-xs text-slate-500">{incident.reference}</p>
                    </div>
                </div>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Security personnel</Label>
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger className="w-full rounded-xl">
                                <SelectValue placeholder="Select personnel" />
                            </SelectTrigger>
                            <SelectContent>
                                {personnel.map((person) => (
                                    <SelectItem key={person.id} value={String(person.id)}>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${statusDotClass[person.status]}`}
                                            />
                                            <span>{person.name}</span>
                                            <span className="text-xs text-slate-400">
                                                · {person.role}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedPerson && (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-linear-to-br from-orange-900 to-orange-600 text-xs font-bold text-white">
                                    {selectedPerson.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">
                                    {selectedPerson.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {selectedPerson.open_cases} open case
                                    {selectedPerson.open_cases === 1 ? "" : "s"} · {selectedPerson.status}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Note for assignee (optional)</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add any context this person should know before responding..."
                            className="min-h-20 resize-none rounded-xl"
                        />
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
                        disabled={!selectedPerson || submitting}
                        onClick={handleAssign}
                        className="rounded-xl bg-orange-950 text-white hover:bg-orange-900"
                    >
                        {submitting ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}