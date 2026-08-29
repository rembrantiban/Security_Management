import { useState } from "react";
import { CheckCircle2, TriangleAlert, Loader2, MapPin } from "lucide-react";
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
import { useIncidentReport } from "@/hooks/useIncidentsReport";

type ResolveIncidentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: {
        incident_id: number;
        incident_number: string;
        title: string;
        severity: "Low" | "Medium" | "High" | "Critical";
        location: string;
    } | null;
    /** Called after the incident is successfully resolved. */
    onResolved?: () => void;
};

const chip =
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 whitespace-nowrap";

const severityStyles: Record<
    NonNullable<ResolveIncidentDialogProps["incident"]>["severity"],
    { chip: string; dot: string }
> = {
    Critical: { chip: "bg-red-50 text-red-700 ring-red-100", dot: "bg-red-500" },
    High: { chip: "bg-orange-50 text-orange-700 ring-orange-100", dot: "bg-orange-500" },
    Medium: { chip: "bg-yellow-50 text-yellow-700 ring-yellow-100", dot: "bg-yellow-500" },
    Low: { chip: "bg-slate-50 text-slate-500 ring-slate-200", dot: "bg-slate-300" },
};

export default function ResolveIncidentDialog({
    open,
    onOpenChange,
    incident,
    onResolved,
}: ResolveIncidentDialogProps) {
    const { resolvedIncident } = useIncidentReport();

    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleResolve = async () => {
        if (!incident) return;

        setLoading(true);

        try {
            const success = await resolvedIncident(incident.incident_id);

            if (success) {
                showToast(
                    "success",
                    "Incident Resolved",
                    "The incident has been marked as resolved."
                );

                onResolved?.();
                onOpenChange(false);
            } else {
                showToast(
                    "error",
                    "Resolution Failed",
                    "Unable to mark the incident as resolved."
                );
            }
        } catch (error) {
            console.error(error);

            showToast("error", "Something went wrong", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!incident) return null;

    const sev = severityStyles[incident.severity];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 ring-slate-200 sm:max-w-md">

                <DialogHeader className="space-y-0 border-b border-slate-100 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="text-[13px] font-semibold tracking-tight text-slate-900">
                                Mark as resolved
                            </DialogTitle>

                            <DialogDescription className="mt-0.5 text-[11px] text-slate-400">
                                This removes the incident from your active queue.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-3 px-5 py-4">

                    {/* Incident being resolved */}
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                            {incident.title}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`${chip} ${sev.chip}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                {incident.severity}
                            </span>

                            <span className="font-mono text-[11px] tracking-tight text-slate-400">
                                {incident.incident_number}
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {incident.location}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />

                        <p className="text-[12px] leading-relaxed text-amber-900">
                            Confirm this incident has been fully handled on site before
                            marking it resolved.
                        </p>
                    </div>

                </div>

                <DialogFooter className="gap-2 border-t border-slate-100 px-5 py-3.5">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="h-9 rounded-xl px-4 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleResolve}
                        disabled={loading}
                        className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-[12.5px] font-medium text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Resolving…
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Resolve incident
                            </>
                        )}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}