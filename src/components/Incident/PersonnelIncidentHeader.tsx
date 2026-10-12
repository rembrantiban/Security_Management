import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader, { HEADER_PRIMARY_BUTTON } from "@/components/layout/PageHeader";

type IncidentHeaderProps = {
  onCreateIncident: () => void;
  description?: string;
};

export default function PersonnelIncidentHeader({
  onCreateIncident,
  description = "Track everything you've reported — progress, assignment, and updates through to resolution.",
}: IncidentHeaderProps) {
  return (
    <PageHeader
      eyebrow="Incident management"
      title=" Incident Reports"
      description={description}
      actions={
        <Button onClick={onCreateIncident} className={HEADER_PRIMARY_BUTTON}>
          <Plus className="h-3.5 w-3.5" />
          Report incident
        </Button>
      }
    />
  );
}
