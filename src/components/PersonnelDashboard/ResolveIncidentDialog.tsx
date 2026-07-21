import { useState } from "react";
import {
    CheckCircle2,
    TriangleAlert,
    Loader2,
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
};
;

export default function ResolveIncidentDialog({
    open,
    onOpenChange,
    incident,
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

        showToast(
            "error",
            "Something went wrong",
            "Please try again."
        );
    } finally {
        setLoading(false);
    }
};

    if (!incident) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">

                <div className="bg-linear-to-r from-amber-900 to-amber-800 px-6 py-8 text-white">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <DialogHeader className="mt-5">

                        <DialogTitle className="text-center text-2xl font-bold text-white">
                            Mark as Resolved
                        </DialogTitle>

                        <DialogDescription className="text-center text-amber-100">
                            This incident will be marked as resolved and
                            removed from your active queue.
                        </DialogDescription>

                    </DialogHeader>

                </div>

                <div className="space-y-5 p-6">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                        <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-600" />

                        <div>

                            <h4 className="font-medium text-amber-900">
                                Confirmation Required
                            </h4>

                            <p className="mt-1 text-sm text-amber-700">
                                Please confirm that this incident has
                                been fully handled before marking it as
                                resolved.
                            </p>

                        </div>

                    </div>

                </div>

                <DialogFooter className="border-t bg-muted/20 px-6 py-4">

                    <Button
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleResolve}
                        disabled={loading}
                        className="bg-amber-800 hover:bg-amber-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resolving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Resolve Incident
                            </>
                        )}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}