import { useEffect, useState } from "react";
import {
    Archive,
    ArchiveRestore,
    Loader2,
    Siren,
    ShieldAlert,
    AlertTriangle,
    MapPin,
    Clock,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useToast } from "@/hooks/useToast";
import type { Incident } from "@/store/useIncidentReportStore";

type ArchivedIncidentsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";

const severityConfig: Record<
    IncidentSeverity,
    { icon: typeof Siren; className: string }
> = {
    Critical: {
        icon: Siren,
        className: "bg-red-100 text-red-700",
    },
    High: {
        icon: ShieldAlert,
        className: "bg-orange-100 text-orange-700",
    },
    Medium: {
        icon: AlertTriangle,
        className: "bg-amber-100 text-amber-700",
    },
    Low: {
        icon: AlertTriangle,
        className: "bg-slate-100 text-slate-600",
    },
};

export default function ArchivedIncidentsModal({
    open,
    onOpenChange,
}: ArchivedIncidentsModalProps) {
    const {
        archivedIncidents,
        isFetchingArchived,
        getArchivedIncidents,
        restoreIncident,
    } = useIncidentReport();
    const { showToast } = useToast();
    const [restoringId, setRestoringId] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            getArchivedIncidents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleRestore = async (incident: Incident) => {
        setRestoringId(incident.incident_id);

        const success = await restoreIncident(incident.incident_id);

        setRestoringId(null);

        if (success) {
            showToast(
                "success",
                "Incident Restored",
                `${incident.incident_number} has been restored to the active list.`
            );
        } else {
            showToast(
                "error",
                "Restore Failed",
                "Unable to restore this incident. Please try again."
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden">
                {/* Header */}
                <div className="border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 px-8 py-7">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-300">
                        <Archive className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
                        Archived Incidents
                    </h2>

                    <p className="mt-1.5 text-center text-sm leading-6 text-slate-500">
                        Incidents removed from the active list. Restore any
                        of them to bring it back into circulation.
                    </p>
                </div>

                {/* Body */}
                <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
                    {isFetchingArchived && archivedIncidents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            <p className="text-sm text-slate-500">
                                Loading archived incidents...
                            </p>
                        </div>
                    ) : archivedIncidents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                <Archive className="h-8 w-8 text-slate-400" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    No Archived Incidents
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Resolved or closed incidents you archive
                                    will appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {archivedIncidents.map((incident) => {
                                const config =
                                    severityConfig[
                                        incident.severity as IncidentSeverity
                                    ];
                                const SeverityIcon = config.icon;
                                const isRestoring =
                                    restoringId === incident.incident_id;

                                return (
                                    <div
                                        key={incident.incident_id}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                                    >
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
                                        >
                                            <SeverityIcon className="h-4.5 w-4.5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-900">
                                                {incident.title}
                                            </p>

                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                                <span>
                                                    {incident.incident_number}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {incident.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Archived{" "}
                                                    {new Date(
                                                        incident.updated_at
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="shrink-0 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
                                            disabled={isRestoring}
                                            onClick={() =>
                                                handleRestore(incident)
                                            }
                                        >
                                            {isRestoring ? (
                                                <>
                                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    Restoring...
                                                </>
                                            ) : (
                                                <>
                                                    <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" />
                                                    Restore
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t bg-slate-50 px-6 py-4">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
