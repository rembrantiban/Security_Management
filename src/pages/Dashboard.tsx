import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  BarChart3,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { user } = useAuth();
  return (
    <>
      <div className="space-y-2">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white border border-gray-300 px-6 py-4" >
          <div>
            <h1 className="text-xl font-bold text-gray-800">
             Welcome {user?.first_name || "User"} 👋
          </h1>
          <p className="text-sm text-gray-500">
            View system analytics, monitor activities, and manage security operations.
          </p>
          </div>
          <Button> <Download /> Export Data</Button>
        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-2">
          <Card title="Total Users" value="1,245" icon={<Users />} color="text-blue-500" />
          <Card title="Active Guards" value="32" icon={<Shield />} color="text-green-500" />
          <Card title="Incidents" value="8" icon={<AlertTriangle />} color="text-red-500" />
          <Card title="Logs Today" value="356" icon={<FileText />} color="text-orange-500" />
        </div>

        {/* 🔥 ANALYTICS FEATURES */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Analytics & Reports
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <Feature title="User Activity Logs" icon={<Activity />} onClick={() => { setSelected("Logs"); setOpen(true); }} />
            <Feature title="Security Alerts" icon={<Shield />} onClick={() => { setSelected("Alerts"); setOpen(true); }} />
            <Feature title="System Status" icon={<BarChart3 />} onClick={() => { setSelected("Status"); setOpen(true); }} />
            <Feature title="Export Data" icon={<Download />} onClick={() => { setSelected("Export"); setOpen(true); }} />
            <Feature title="Print Reports" icon={<Printer />} onClick={() => { setSelected("Reports"); setOpen(true); }} />

          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* ACTIVITY */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              <ActivityItem text="User login detected" time="2 mins ago" />
              <ActivityItem text="Unauthorized access attempt" time="10 mins ago" />
              <ActivityItem text="Incident report submitted" time="30 mins ago" />
              <ActivityItem text="Guard check-in completed" time="1 hour ago" />
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              System Status
            </h3>

            <div className="space-y-4 text-sm">
              <Status label="System Health" value="Good" color="text-green-500" />
              <Status label="Active Sessions" value="128" />
              <Status label="Alerts" value="3" color="text-red-500" />
            </div>
          </div>

        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-xl font-bold mb-4">
              {selected}
            </h2>

            {/* CONTENT */}
            <ModalContent type={selected} />
          </div>
        </div>
      )}
    </>
  );
}

/* 🔹 COMPONENTS */

function Card({ title, value, icon, color }: any) {
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

function Feature({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="text-orange-500">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
  );
}

function ActivityItem({ text, time }: any) {
  return (
    <div className="flex justify-between">
      <span>🔐 {text}</span>
      <span className="text-gray-400">{time}</span>
    </div>
  );
}

function Status({ label, value, color = "" }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function ModalContent({ type }: { type: string | null }) {
  switch (type) {
    case "Incident Summary":
      return (
        <div className="space-y-3 text-sm">
          <p>Total Incidents: <b>25</b></p>
          <p>Resolved: <span className="text-green-500">18</span></p>
          <p>Pending: <span className="text-red-500">7</span></p>
        </div>
      );

    case "Logs":
      return <p className="text-sm">Viewing user activity logs...</p>;

    case "Alerts":
      return <p className="text-sm">Security alerts overview...</p>;

    case "Status":
      return <p className="text-sm">System is running normally.</p>;

    case "Export":
      return <button className="bg-blue-500 text-white px-4 py-2 rounded">Export Data</button>;

    case "Reports":
      return <button className="bg-gray-800 text-white px-4 py-2 rounded">Print Report</button>;

    default:
      return <p>Select an option</p>;
  }
}