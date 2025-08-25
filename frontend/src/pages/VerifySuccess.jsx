import { Link } from "react-router-dom";

export default function VerifySuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-900 via-pink-800 to-black">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Email Verified Successfully!
        </h2>
        <p className="text-gray-700 mb-6">
          Your account has been activated. You can now log in.
        </p>
        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
