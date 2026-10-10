import { useState } from "react";
import { useIncidentReport } from "@/hooks/useIncidentsReport";
import { useToast } from "@/hooks/useToast";
import {
    EvidencePicker,
    IncidentDetailsFields,
    IncidentFormDialog,
} from "./IncidentFormFields";
import {
    EMPTY_INCIDENT_FORM,
    isIncidentFormValid,
    resolveCategory,
    type IncidentFormValues,
} from "./incidentForm";

type ReportIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ReportIncidentModal({
    open,
    onOpenChange,
}: ReportIncidentModalProps) {
    const [values, setValues] = useState<IncidentFormValues>(EMPTY_INCIDENT_FORM);
    const [evidence, setEvidence] = useState<File | null>(null);
    const { createIncident, isLoading, error } = useIncidentReport();
    const { showToast } = useToast();

    const isValid = isIncidentFormValid(values);

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setValues(EMPTY_INCIDENT_FORM);
            setEvidence(null);
        }, 200);
    }

    const handleSubmit = async () => {
        if (!isValid) return;

        const success = await createIncident({
            title: values.title,
            category: resolveCategory(values),
            severity: values.severity,
            location: values.location,
            description: values.description,
            incident_image: evidence,
        });

        if (success) {
            showToast(
                "success",
                "Incident Reported",
                "Your incident report has been submitted successfully."
            );
            handleClose();
        } else {
            showToast(
                "error",
                "Submission Failed",
                error || "Something went wrong while submitting your report."
            );
        }
    };

    return (
        <IncidentFormDialog
            open={open}
            onClose={handleClose}
            title="Report Incident"
            description="Fill in the details below to file a new report."
            submitLabel="Submit report"
            submittingLabel="Submitting…"
            canSubmit={isValid}
            isSubmitting={isLoading}
            onSubmit={handleSubmit}
        >
            <IncidentDetailsFields
                values={values}
                onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
            />
            <EvidencePicker file={evidence} onFileChange={setEvidence} />
        </IncidentFormDialog>
    );
}
