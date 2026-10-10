import { useEffect, useState } from "react";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import type { Incident } from "@/store/useIncidentReportStore";
import { useToast } from "@/hooks/useToast";
import {
    EvidencePicker,
    IncidentDetailsFields,
    IncidentFormDialog,
} from "./IncidentFormFields";
import {
    EMPTY_INCIDENT_FORM,
    categoryToForm,
    isIncidentFormValid,
    resolveCategory,
    type IncidentFormValues,
} from "./incidentForm";

type UpdateReportIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: Incident | null;
};

function toFormValues(incident: Incident): IncidentFormValues {
    return {
        ...EMPTY_INCIDENT_FORM,
        ...categoryToForm(incident.category),
        title: incident.title,
        severity: incident.severity,
        location: incident.location,
        description: incident.description,
    };
}

export default function UpdateReportIncidentModal({
    open,
    onOpenChange,
    incident,
}: UpdateReportIncidentModalProps) {
    const [values, setValues] = useState<IncidentFormValues>(EMPTY_INCIDENT_FORM);
    /** A newly selected file; the current evidence is kept when null. */
    const [newEvidence, setNewEvidence] = useState<File | null>(null);
    const { updateIncident, isLoading } = useIncidentReport();
    const { showToast } = useToast();

    // Load the incident's saved values every time the modal opens, so
    // reopening after an unsaved edit starts from the stored report.
    useEffect(() => {
        if (!open || !incident) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(toFormValues(incident));
        setNewEvidence(null);
    }, [open, incident]);

    const isValid = isIncidentFormValid(values);

    function handleClose() {
        onOpenChange(false);
    }

    const handleSubmit = async () => {
        if (!isValid || !incident) return;

        const success = await updateIncident(incident.incident_id, {
            title: values.title,
            category: resolveCategory(values),
            severity: values.severity,
            location: values.location,
            description: values.description,
            incident_image: newEvidence,
        });

        if (success) {
            handleClose();

            showToast(
                "success",
                "Incident Updated",
                "The incident report has been updated successfully."
            );
        }
    };

    return (
        <IncidentFormDialog
            open={open}
            onClose={handleClose}
            title="Update Incident"
            description={
                incident
                    ? `Edit the details of ${incident.incident_number}.`
                    : "Edit the details of this report."
            }
            submitLabel="Save changes"
            submittingLabel="Saving…"
            canSubmit={isValid}
            isSubmitting={isLoading}
            onSubmit={handleSubmit}
        >
            <IncidentDetailsFields
                values={values}
                onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
            />
            <EvidencePicker
                file={newEvidence}
                onFileChange={setNewEvidence}
                currentUrl={incident?.incident_image}
            />
        </IncidentFormDialog>
    );
}
