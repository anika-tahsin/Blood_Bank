
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Nav */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 text-gray-800 px-6 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-red-400 text-gray-300 py-5 mt-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="text-red-700 font-semibold">Blood Bank</span>.  
            All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-900">
            Donate Blood • Save Lives
          </p>
        </div>
      </footer>
    </div>
  );
}
