import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import CreateBloodRequestForm from '../../components/CreateBloodRequestForm';
import { useAuth } from '../../context/AuthContext.jsx';


const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    blood_group: '',
    urgency: '',
    my_requests: false
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const { api } = useAuth();

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const urgencyLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`accounts/blood-requests/?${params}`);
      setRequests(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch blood requests');
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const acceptRequest = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      await api.post(`accounts/blood-requests/${requestId}/accept_request/`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to accept request';
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const cancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      await api.post(`accounts/blood-requests/${requestId}/cancel_request/`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel request';
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'accepted': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-600">Browse and manage blood donation requests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <select
              value={filters.blood_group}
              onChange={(e) => handleFilterChange('blood_group', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Urgency Levels</option>
              {urgencyLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.my_requests}
                onChange={(e) => handleFilterChange('my_requests', e.target.checked)}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">My requests only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new request.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.patient_name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency_display}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status_display}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Blood Group:</span>
                        <span className="ml-1 font-semibold text-red-600">{request.blood_group}</span>
                      </div>
                      <div>
                        <span className="font-medium">Units Needed:</span>
                        <span className="ml-1">{request.units_needed}</span>
                      </div>
                      <div>
                        <span className="font-medium">Hospital:</span>
                        <span className="ml-1">{request.hospital_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <span className="ml-1">{request.contact_phone}</span>
                      </div>
                    </div>
                    
                    {request.needed_by_date && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-600">Needed by:</span>
                        <span className={`ml-1 ${request.days_remaining <= 3 ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                          {new Date(request.needed_by_date).toLocaleDateString()}
                          {request.days_remaining !== null && (
                            <span className="ml-2">
                              ({request.days_remaining > 0 
                                ? `${request.days_remaining} days remaining`
                                : request.days_remaining === 0 
                                ? 'Due today'
                                : 'Overdue'
                              })
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Requested by:</span>
                      <span className="ml-1">{request.requester_name || request.requester_username}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>

                    {request.additional_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium text-gray-700">Additional Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{request.additional_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {request.status === 'pending' && !filters.my_requests && (
                      <button
                        onClick={() => acceptRequest(request.id)}
                        disabled={actionLoading[request.id]}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {actionLoading[request.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                        Accept Request
                      </button>
                    )}
                    
                    {filters.my_requests && (request.status === 'pending' || request.status === 'accepted') && (
                      <button
                        onClick={() => cancelRequest(request.id)}
                        disabled={actionLoading[request.id]}
                        className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {actionLoading[request.id] ? (
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
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Request Modal Placeholder */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Blood Request</h3>
            <p className="text-gray-600 mb-4">Create request form will be implemented here.</p>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
        <CreateBloodRequestForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={(newRequest) => {
          console.log('Request created:', newRequest);
          fetchRequests(); // Refresh the list
          alert('Blood request created successfully!');
        }}
      />
    </div>
  );
};

export default BloodRequests;