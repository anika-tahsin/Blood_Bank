import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Donors from "./pages/Donate";
import Patients from "./pages/dashboard/Patients";
import Inventory from "./pages/dashboard/Inventory";

export default function App() {
  return (
    <Routes>
      {/* Public Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="donors" element={<Donors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>
    </Routes>
  );
}
