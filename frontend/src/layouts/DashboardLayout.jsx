import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
