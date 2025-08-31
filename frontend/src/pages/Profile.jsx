import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { api } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    address: "",
    blood_group: "",
    last_donation_date: "",
    is_available_for_donation: true,
    phone_number: "",
  });

  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  // api.post('/accounts/profile/', formData)
  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("accounts/profile/");
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || "",
        age: response.data.age || "",
        address: response.data.address || "",
        blood_group: response.data.blood_group || "",
        last_donation_date: response.data.last_donation_date || "",
        is_available_for_donation: response.data.is_available_for_donation ?? true,
        phone_number: response.data.phone_number || "",
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist, enable editing mode
        setIsEditing(true);
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let response;
      if (profile) {
        // Update existing profile
        response = await api.put("accounts/profile/", formData);
        setSuccess("Profile updated successfully!");
      } else {
        // Create new profile
        response = await api.post("accounts/profile/", formData);
        setSuccess("Profile created successfully!");
      }
      
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save profile";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      // Reset form to original profile data
      setFormData({
        full_name: profile.full_name || "",
        age: profile.age || "",
        address: profile.address || "",
        blood_group: profile.blood_group || "",
        last_donation_date: profile.last_donation_date || "",
        is_available_for_donation: profile.is_available_for_donation ?? true,
        phone_number: profile.phone_number || "",
      });
      setIsEditing(false);
    }
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              {profile ? "Your Profile" : "Create Your Profile"}
            </h1>
            <p className="text-red-100 mt-2">
              {profile ? "Manage your donor information" : "Complete your profile to become a donor"}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <div className="p-8">
            {!isEditing && profile ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-lg text-gray-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <p className="text-lg text-gray-900">{profile.age} years old</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {profile.blood_group}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <p className="text-lg text-gray-900">{profile.phone_number || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <p className="text-lg text-gray-900">{profile.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Donation</label>
                    <p className="text-lg text-gray-900">
                      {profile.last_donation_date || "Never donated"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available for Donation</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profile.is_available_for_donation 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {profile.is_available_for_donation ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // Edit/Create Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="16"
                      max="65"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group *
                    </label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Donation Date
                    </label>
                    <input
                      type="date"
                      name="last_donation_date"
                      value={formData.last_donation_date}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_available_for_donation"
                      id="is_available_for_donation"
                      checked={formData.is_available_for_donation}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_available_for_donation" className="ml-3 text-sm font-medium text-gray-700">
                      Available for donation
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-200 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
                  </button>

                  {profile && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}