import { Routes, Route } from "react-router-dom"
import './App.css'
import HomePage from "./pages/Homapage"
import Dashboard from "./pages/Dashboard"
import DashboardLayout from "@/components/layout/DashboardLayout"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>

    </>
  )
}

export default App
