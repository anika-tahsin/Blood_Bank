import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from '../../context/AuthContext.jsx';

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();


  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await api.get("/dashboard/donors/"); 
        setDonors(res.data);
      } catch (err) {
        setError("Coming soon!"); 
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Loading donors...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-900 via-pink-800 to-black p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          🩸 Donors List
        </h2>
        {donors.length === 0 ? (
          <p className="text-center text-gray-600">No donors available.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {donors.map((donor) => (
              <li
                key={donor.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{donor.name}</p>
                  <p className="text-sm text-gray-600">
                    Blood Group: {donor.blood_group}
                  </p>
                </div>
                <span className="text-gray-700">{donor.contact}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

