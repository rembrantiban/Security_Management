import { useEffect, useId, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    MessageSquareText,
    ShieldCheck,
    TriangleAlert,
    UserRound,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useIncidentStore, type Incident } from "@/store/useIncidentReportStore";
import {
    INCIDENT_CHIP,
    SEVERITY_CONFIG,
    STATUS_CHIP,
    formatIncidentDateTime,
} from "./incidentUi";

const MIN_NOTE_LENGTH = 10;
const MAX_NOTE_LENGTH = 1000;

/** The fields the modal needs; satisfied by both Incident and AssignedIncident. */
export type ResolvableIncident = {
    incident_id: number;
    incident_number: string;
    title: string;
    severity: Incident["severity"];
    status: Incident["status"];
    location: string;
    description?: string;
    created_at?: string;
    /** Name of the reporter, when known. */
    reporterName?: string | null;
    /** Name of the administrator who assigned it, when known. */
    assignedByName?: string | null;
    /** Instructions left by the administrator. */
    note?: string | null;
};

type ResolveIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: ResolvableIncident | null;
    /** Called after the incident is successfully resolved. */
    onResolved?: () => void;
};

export default function ResolveIncidentModal({
    open,
    onOpenChange,
    incident,
    onResolved,
}: ResolveIncidentModalProps) {
    const resolvedIncident = useIncidentStore((s) => s.resolvedIncident);
    const { showToast } = useToast();
    const noteId = useId();

    const [note, setNote] = useState("");
    const [touched, setTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Start each incident with a clean form.
    useEffect(() => {
        if (!open) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNote("");
        setTouched(false);
    }, [open, incident?.incident_id]);

    if (!incident) return null;

    const trimmed = note.trim();
    const tooShort = trimmed.length < MIN_NOTE_LENGTH;
    const showError = touched && tooShort;
    const sev = SEVERITY_CONFIG[incident.severity];
    const SeverityIcon = sev.icon;

    const handleOpenChange = (next: boolean) => {
        if (submitting) return;
        onOpenChange(next);
    };

    const handleResolve = async () => {
        setTouched(true);
        if (tooShort || submitting) return;

        setSubmitting(true);
        const success = await resolvedIncident(incident.incident_id, trimmed);
        setSubmitting(false);

        if (success) {
            showToast(
                "success",
                "Incident Resolved",
                `${incident.incident_number} has been marked as resolved.`
            );
            onResolved?.();
            onOpenChange(false);
            return;
        }

        showToast(
            "error",
            "Resolution Failed",
            useIncidentStore.getState().error ?? "Unable to mark the incident as resolved."
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 ring-slate-200 sm:max-w-lg">
                {/* Header */}
                <DialogHeader className="shrink-0 space-y-0 border-b border-slate-100 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Resolve incident
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-[11px] text-slate-500">
                                Record how the incident was handled before closing it out.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    {/* Incident summary */}
                    <section className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${sev.tile}`}
                            >
                                <SeverityIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-snug text-slate-900">
                                    {incident.title}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <span className={`${INCIDENT_CHIP} ${sev.chip}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                        {incident.severity}
                                    </span>
                                    <span className={`${INCIDENT_CHIP} ${STATUS_CHIP[incident.status]}`}>
                                        {incident.status}
                                    </span>
                                    <span className="font-mono text-[11px] tracking-tight text-slate-500">
                                        {incident.incident_number}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <dl className="mt-3 grid gap-x-4 gap-y-1.5 border-t border-slate-200/70 pt-3 text-[11.5px] sm:grid-cols-2">
                            <MetaItem icon={MapPin} label="Location" value={incident.location} />
                            {incident.created_at && (
                                <MetaItem
                                    icon={Clock3}
                                    label="Reported"
                                    value={formatIncidentDateTime(incident.created_at)}
                                />
                            )}
                            {incident.reporterName && (
                                <MetaItem icon={UserRound} label="Reported by" value={incident.reporterName} />
                            )}
                            {incident.assignedByName && (
                                <MetaItem icon={ShieldCheck} label="Assigned by" value={incident.assignedByName} />
                            )}
                        </dl>

                        {incident.description && (
                            <p className="mt-3 whitespace-pre-line border-t border-slate-200/70 pt-3 text-[12px] leading-relaxed text-slate-600">
                                {incident.description}
                            </p>
                        )}
                    </section>

                    {incident.note && (
                        <section className="flex gap-2.5 rounded-xl bg-blue-50/60 p-3 ring-1 ring-blue-100">
                            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-blue-700">
                                    Dispatch instructions
                                </p>
                                <p className="mt-0.5 whitespace-pre-line text-[12px] leading-relaxed text-blue-900">
                                    {incident.note}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Resolution summary */}
                    <section>
                        <div className="mb-1.5 flex items-baseline justify-between">
                            <label htmlFor={noteId} className="text-[12px] font-medium text-slate-800">
                                Resolution summary <span className="text-red-500">*</span>
                            </label>
                            <span
                                className={`text-[10.5px] tabular-nums ${
                                    note.length > MAX_NOTE_LENGTH * 0.9 ? "text-amber-700" : "text-slate-400"
                                }`}
                            >
                                {note.length}/{MAX_NOTE_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id={noteId}
                            value={note}
                            maxLength={MAX_NOTE_LENGTH}
                            rows={4}
                            disabled={submitting}
                            onChange={(e) => setNote(e.target.value)}
                            onBlur={() => setTouched(true)}
                            aria-invalid={showError}
                            aria-describedby={`${noteId}-hint`}
                            placeholder="Describe the action taken, the outcome, and any follow-up needed…"
                            className={`w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:opacity-60 ${
                                showError
                                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-50"
                            }`}
                        />
                        <p
                            id={`${noteId}-hint`}
                            className={`mt-1 text-[11px] ${showError ? "text-red-500" : "text-slate-400"}`}
                        >
                            {showError
                                ? `Please write at least ${MIN_NOTE_LENGTH} characters.`
                                : "Saved to the activity log for audit purposes."}
                        </p>
                    </section>

                    <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                        <p className="text-[12px] leading-relaxed text-amber-900">
                            Only resolve once the situation is fully handled on site. Resolved
                            incidents leave your active queue and can no longer be edited.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 bg-white px-5 py-3.5">
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={submitting}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleResolve}
                        disabled={submitting || (touched && tooShort)}
                        className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-[12.5px] font-medium text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Resolving…
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark as resolved
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MetaItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof MapPin;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-3 w-3 shrink-0 text-slate-400" />
            <dt className="shrink-0 text-slate-400">{label}</dt>
            <dd className="truncate font-medium text-slate-700">{value}</dd>
        </div>
    );
}
