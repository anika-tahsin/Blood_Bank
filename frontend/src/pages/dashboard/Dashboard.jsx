import useAuth from "../../context/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-red-700">
        🩸 Welcome, {user?.username || user?.email}!
      </h1>

      <p className="text-gray-700">
        This is your personalized dashboard. From here you can:
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li>Request blood if you are in need</li>
        <li>Donate blood to help others</li>
        <li>Track available donors, patients, and inventory</li>
      </ul>
    </div>
  );
}

