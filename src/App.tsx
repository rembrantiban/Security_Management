import { TextDots } from "@/components/loading-ui/text-dots";
import { TextBlink } from "@/components/loading-ui/text-blink";

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import './App.css'
import Dashboard from "./pages/Dashboard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Register from "./pages/Register"
import { useAuth } from "@/hooks/useAuth"
import UsersPage from "./pages/UserPage";
import Incident from "./pages/Incident";
import ViewUserPage from "./pages/ViewUserPage";
import PersonnelDashboard from "./pages/PersonnelDashboard"
import MyAccount from "./pages/MyAccount";
import OtherRoleAccount from "./pages/OtherRoleAccount";
import PersonnelIncidentsPage from "./pages/Personnelincidentspage";
import StatusToast from "@/components/GlobalToast/StatusToast"
import Monitoring from "./pages/Monitoring"
import AssignAreas from "./pages/AssignArea"
import Loginpage from "./pages/Loginpage"
import RequestPage from "./pages/RequestPage"
import AdminVisitorRequestsPage from "./pages/Adminvisitorrequestspage";
import MyPatrolReportsPage from "./pages/MyPatrolReportsPage";
import PersonnelPatrolsPage from "./pages/PersonnelPatrolsPage";
import Permissions from "./pages/Permissions";
import RolePermission from "@/pages/RolePermissions"
import { useAuthStore } from "./store/useAuthStore";
import Report from "@/pages/Report"
import SessionExpiredModal from "@/components/Modal/SessionExpiredModal"
import StaffDashboard from "@/pages/StaffDashboard"
import StaffIncidentsPage from "@/pages/StaffIncidentsPage"
import VisitorHistoryPage from "@/pages/VisitorHistoryPage"
import VisitorBlacklistPage from "@/pages/VisitorBlacklistPage"
import NotificationsPage from "@/pages/NotificationsPage"


function App() {
  const { getMeLoading, getCurrentUser } = useAuth();
 useEffect(() => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
        getCurrentUser();
    }
  //eslint-disable-next-line
}, []);


  if (getMeLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center">
          <TextBlink className="text-xl"><img src="/sfc.png" alt="Logo" className="w-16 h-16" /></TextBlink>
          <TextDots className="text-lg font-medium text-orange-900">loading</TextDots>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Loginpage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/incidents" element={<Incident />} />
          <Route path="/users/view/:user_id" element={<ViewUserPage />} />
          <Route path="/personnel/dashboard" element={<PersonnelDashboard />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/incidents" element={<StaffIncidentsPage />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/other-role-account" element={<OtherRoleAccount />} />
          <Route path="/personnel/incidents" element={<PersonnelIncidentsPage />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/personnel/surveillance" element={<AssignAreas />} />
          <Route path="/personnel/patrols" element={<PersonnelPatrolsPage />} />
          <Route path="/personnel/visitors" element={<RequestPage />} />
          <Route path="/access" element={<AdminVisitorRequestsPage />} />
          <Route path="/visitor-history" element={<VisitorHistoryPage />} />
          <Route path="/blacklist" element={<VisitorBlacklistPage />} />
          <Route path="/personnel/reports" element={<MyPatrolReportsPage />} />
          <Route path="/it-system-administrator/permissions" element={<Permissions />} />
          <Route path="/it-system-administrator/role-access" element={<RolePermission />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/personnel/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      <StatusToast />
      <SessionExpiredModal />
    </>
  )
}

export default App
