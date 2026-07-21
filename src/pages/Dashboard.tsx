import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import IncidentSummaryDashboard from "@/components/Dashboard/IncidentSummaryDashboard";
import ActivityTimeline from "@/components/Dashboard/ActivityTimeline";
import PendingRequestsTable from "@/components/Dashboard/PendingRequestsTable";
import SystemStatus from "@/components/Dashboard/SystemStatus"
//import ViewIncidentStatistics from "@/components/Dashboard/ViewIncidentStatistics";
import ViewSecurityAnalytics from "@/components/Dashboard/ViewSecurityAnalytics";
export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <div className="space-y-2">

        {/* HEADER */}
        <div className="relative overflow-hidden rounded border border-orange-100 bg-white shadow-sm">

          <div className="absolute inset-0 bg-linear-to-r from-orange-50 via-white to-orange-100" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-4">

            <div className="space-y-2">

              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Security Management Dashboard
              </span>

              <h1 className=" text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.first_name || "User"} 👋
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-4 text-slate-600">
                View real-time security analytics, monitor personnel activities,
                manage incidents, and oversee campus surveillance from one centralized dashboard.
              </p>

            </div>

            <Button
              size="lg"
              className="rounded-xl bg-orange-700 hover:bg-orange-800 shadow-md"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>

          </div>

        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-2">
          <Card title="Total Users" value="1,245" icon={<Users />} color="text-blue-500" />
          <Card title="Active Guards" value="32" icon={<Shield />} color="text-green-500" />
          <Card title="Incidents" value="8" icon={<AlertTriangle />} color="text-red-500" />
          <Card title="Logs Today" value="356" icon={<FileText />} color="text-orange-500" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <SystemStatus />
          <ViewSecurityAnalytics />
        </div>
        {/* 🔥 ANALYTICS FEATURES */}
        <div className="grid md:grid-cols-2 gap-4">
          <IncidentSummaryDashboard />
          <ActivityTimeline />
        </div>

        <div>
          <PendingRequestsTable />
        </div>
      </div>


    </>
  );
}

/* 🔹 COMPONENTS */

function Card({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white p-5 rounded  shadow-sm border border-gray-300">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={color}>{icon}</div>
      </div>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}







