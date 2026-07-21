import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import type { Incident } from "@/store/useIncidentReportStore";


type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";

const severityIcon: Record<IncidentSeverity, typeof Siren> = {
    Critical: Siren,
    High: ShieldAlert,
    Medium: AlertTriangle,
    Low: AlertTriangle,
};

{/*const statusDotClass: Record<PersonnelType["status"], string> = {
    Available: "bg-emerald-500",
    "On Duty": "bg-blue-500",
    "Off Duty": "bg-slate-300",
};
*/}

type AssignIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: Incident | null;
    onAssign: (assignedTo: number, note: string) => Promise<void>;
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
    const { securityPersonnel, getSecurityPersonnel } = useAuth();

    useEffect(() => {
        getSecurityPersonnel();
        //eslint-disable-next-line
    }, []);

    if (!incident) return null;

    const SeverityIcon = severityIcon[incident.severity];
    const selectedPerson = securityPersonnel.find((p) => String(p.user_id) === selectedId);

    const handleAssign = async () => {
        if (!selectedPerson) return;
        setSubmitting(true);
        await onAssign(
            selectedPerson.user_id,
            note
        );
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
                        <p className="text-xs text-slate-500">{incident.incident_number}</p>
                    </div>
                </div>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Security personnel</Label>
                        <Select
                            value={selectedId}
                            onValueChange={(value) => setSelectedId(value ?? "")}
                        >
                            <SelectTrigger className="w-full rounded-xl">
                                <SelectValue>
                                    {selectedPerson
                                        ? `${selectedPerson.first_name} ${selectedPerson.last_name}`
                                        : "Select personnel"}
                                </SelectValue>
                            </SelectTrigger>

                            <SelectContent>
                                {securityPersonnel.map((person) => (
                                    <SelectItem
                                        key={person.user_id}
                                        value={String(person.user_id)}
                                    >
                                        {person.first_name} {person.last_name} · {person.role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedPerson && (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-linear-to-br from-orange-900 to-orange-600 text-xs font-bold text-white">
                                    {selectedPerson.first_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">
                                    {selectedPerson.first_name} {selectedPerson.last_name}
                                </p>
                                <p className={`text-xs ${selectedPerson.on_duty ? "text-green-600" : "text-red-600"}`}>
                                    · {selectedPerson.on_duty ? "On Duty" : "Not On Duty"}
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
        </Dialog >
    );
}