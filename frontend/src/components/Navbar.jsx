import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-red-600">Blood Bank</h1>
      <ul className="flex gap-6 text-gray-700">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/donate">Donate</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}
