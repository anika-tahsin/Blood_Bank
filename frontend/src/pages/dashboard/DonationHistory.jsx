import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import { showSuccess, showError, showInfo} from '../../utils/toast.jsx';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'donor', 'recipient'
  const [actionLoading, setActionLoading] = useState({});
  const { api } = useAuth();

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('role', filter);
      }
      
      const response = await api.get(`accounts/donation-history/?${params}`);
      setDonations(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch donation history');
      console.error('Fetch donations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to confirm this donation? This action cannot be undone.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [donationId]: true }));
      await api.post(`/accounts/donation-history/${donationId}/confirm_donation/`);
      fetchDonations(); 
      showSuccess('Donation confirmed successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to confirm donation';
      // alert(errorMessage);
      showError(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const cancelDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [donationId]: true }));
      await api.post(`/accounts/donation-history/${donationId}/cancel_donation/`);
      fetchDonations(); 
      showSuccess("Request Canceled")// Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel donation';
      // alert(errorMessage);
      showError(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && donations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-600">Track your donations and received blood</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'All History', icon: '📋' },
              { key: 'donor', label: 'My Donations', icon: '🩸' },
              { key: 'recipient', label: 'Received Blood', icon: '🏥' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`${
                  filter === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Donations List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donation history found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'donor' && "You haven't made any donations yet."}
              {filter === 'recipient' && "You haven't received any blood donations yet."}
              {filter === 'all' && "No donation activity found."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {donations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {donation.patient_name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status_display}
                      </span>
                      {donation.urgency && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(donation.urgency)}`}>
                          {donation.urgency_display}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Blood Group:</span>
                        <span className="ml-1 font-semibold text-red-600">{donation.blood_group}</span>
                      </div>
                      <div>
                        <span className="font-medium">Units:</span>
                        <span className="ml-1">{donation.units_donated}</span>
                      </div>
                      <div>
                        <span className="font-medium">Hospital:</span>
                        <span className="ml-1">{donation.hospital_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Request Date:</span>
                        <span className="ml-1">{new Date(donation.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Donor:</span>
                        <span className="ml-1">{donation.donor_name} (@{donation.donor_username})</span>
                        {donation.donor_blood_group && (
                          <span className="ml-2 text-red-600 font-medium">({donation.donor_blood_group})</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Recipient:</span>
                        <span className="ml-1">{donation.recipient_name} (@{donation.recipient_username})</span>
                      </div>
                    </div>

                    {donation.donation_date && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Donation Date:</span>
                        <span className="ml-1 text-green-600 font-medium">
                          {new Date(donation.donation_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {/* Confirm button - only for recipients on pending donations */}
                    {donation.status === 'pending' && filter !== 'donor' && (
                      <button
                        onClick={() => confirmDonation(donation.id)}
                        disabled={actionLoading[donation.id]}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {actionLoading[donation.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Confirm
                      </button>
                    )}
                    
                    {/* Cancel button - for pending/confirmed donations */}
                    {(donation.status === 'pending' || donation.status === 'confirmed') && (
                      <button
                        onClick={() => cancelDonation(donation.id)}
                        disabled={actionLoading[donation.id]}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {actionLoading[donation.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className={`flex items-center ${donation.created_at ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${donation.created_at ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      Request Created
                    </div>
                    <div className={`flex items-center ${donation.status !== 'canceled' && donation.status !== 'pending' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${donation.status !== 'canceled' && donation.status !== 'pending' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      Donation Accepted
                    </div>
                    <div className={`flex items-center ${donation.status === 'confirmed' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${donation.status === 'confirmed' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      Donation Confirmed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;