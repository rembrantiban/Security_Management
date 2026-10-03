import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader, { HEADER_PRIMARY_BUTTON } from "@/components/layout/PageHeader";

type IncidentHeaderProps = {
  onCreateIncident: () => void;
};

export default function PersonnelIncidentHeader({
  onCreateIncident,
}: IncidentHeaderProps) {
  return (
    <PageHeader
      eyebrow="Incident management"
      title="My Incident Reports"
      description="Track everything you've reported — progress, assignment, and updates through to resolution."
      actions={
        <Button onClick={onCreateIncident} className={HEADER_PRIMARY_BUTTON}>
          <Plus className="h-3.5 w-3.5" />
          Report incident
        </Button>
      }
    />
  );
}
