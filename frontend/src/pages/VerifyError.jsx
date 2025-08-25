import { Link } from "react-router-dom";

export default function VerifyError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-800 to-red-900">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ❌ Verification Failed
        </h2>
        <p className="text-gray-700 mb-6">
          The verification link is invalid or expired.
        </p>
        <Link
          to="/register"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Register Again
        </Link>
      </div>
    </div>
  );
}
