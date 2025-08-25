

import { Outlet, Link } from "react-router-dom";
import useAuth from "../context/AuthContext";

export default function DashboardLayout() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-900 via-pink-800 to-black text-white">
        <h2 className="text-2xl font-bold mb-4">🚫 Access Denied</h2>
        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-red-700 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-3">
          <Link to="/dashboard" className="hover:text-red-200">Overview</Link>
          <Link to="/dashboard/donors" className="hover:text-red-200">Donors</Link>
          <Link to="/dashboard/patients" className="hover:text-red-200">Patients</Link>
          <Link to="/dashboard/inventory" className="hover:text-red-200">Inventory</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white shadow-inner">
        <Outlet />
      </main>
    </div>
  );
}
