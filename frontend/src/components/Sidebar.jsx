import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // npm install lucide-react

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden p-4 text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col p-6 transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard" className="hover:text-red-400" onClick={() => setIsOpen(false)}>Overview</Link>
          <Link to="/dashboard/donors" className="hover:text-red-400" onClick={() => setIsOpen(false)}>Donors</Link>
          <Link to="/dashboard/patients" className="hover:text-red-400" onClick={() => setIsOpen(false)}>Patients</Link>
          <Link to="/dashboard/inventory" className="hover:text-red-400" onClick={() => setIsOpen(false)}>Inventory</Link>
        </nav>
      </aside>
    </>
  );
}
