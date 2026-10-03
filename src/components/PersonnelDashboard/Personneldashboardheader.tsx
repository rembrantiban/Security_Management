import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/layout/PageHeader";

const Personneldashboardheader = () => {
    const { user } = useAuth();

    return (
        <PageHeader
            eyebrow="Security Personnel"
            title={`Welcome back, ${user?.first_name || "User"}`}
            description="Your assigned incidents, patrol schedule, and live security alerts for this shift."
        />
    );
};

export default Personneldashboardheader;
