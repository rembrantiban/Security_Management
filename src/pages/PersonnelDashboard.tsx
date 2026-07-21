import AssignedDashboard from "@/components/PersonnelDashboard/AssignedDashboard";
import PersonnelDashboardHeader from "@/components/PersonnelDashboard/Personneldashboardheader";
import ViewAssignedPatrol from "@/components/PersonnelDashboard/ViewAssignedPatrol";

export default function PersonnelDashboardPage() {
    return (
        <div className="space-y-4">
            <PersonnelDashboardHeader />
            <AssignedDashboard />
             <ViewAssignedPatrol />
        </div>
    );
}
