import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears context + tokens
    navigate("/login");
  };

  return (
    <nav className="bg-red-400 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="text-2xl font-extrabold text-rose-600">
          ❤️ Blood Bank
        </Link>

        {/* Links */}
        <div className="flex space-x-6 items-center">
          <Link to="/" className="hover:text-red-200 transition">Home</Link>
          {/* <Link to="/donate" className="hover:text-red-200 transition">Donate</Link> */}
          
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-red-200 transition">
                Dashboard
              </Link>
              <Link to="/dashboard/profile" className="hover:text-red-200 transition">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}