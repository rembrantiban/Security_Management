import { TextDots } from "@/components/loading-ui/text-dots";
import { TextBlink } from "@/components/loading-ui/text-blink";

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import './App.css'
import HomePage from "./pages/Homapage"
import Dashboard from "./pages/Dashboard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Register from "./pages/Register"
import { useAuth } from "@/hooks/useAuth"
import UsersPage from "./pages/UserPage";
import Incident from "./pages/Incident";

function App() {
      const { getMeLoading, getCurrentUser } = useAuth();
      console.log("App rendered");
      useEffect(() => {
        getCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


      if (getMeLoading) {
        return (
        <div className="w-full h-screen flex items-center justify-center ">
           <div className="flex flex-col items-center">
              <TextBlink className="text-xl"><img src="/sfc.png" alt="Logo" className="w-16 h-16" /></TextBlink> 
           <TextDots className="text-lg font-medium text-orange-500">loading</TextDots>
           </div>
        </div>
        )
      }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/incidents" element={<Incident />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
