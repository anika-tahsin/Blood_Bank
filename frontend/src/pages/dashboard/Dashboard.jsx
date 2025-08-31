
import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState({
  total_requests: 0,
  pending_requests: 0,
  approved_requests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { api } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('accounts/dashboard-stats/');
      setStats(response.data.stats);
      setRecentRequests(response.data.recent_requests);
      setRecentDonations(response.data.recent_donations);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your blood donation activity overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* My Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-blue-600 font-medium">{stats.pending_requests}</span>
              <span className="ml-1">pending</span>
              <span className="mx-2">•</span>
              <span className="text-green-600 font-medium">{stats.completed_requests}</span>
              <span className="ml-1">completed</span>
            </div>
          </div>
        </div>

        {/* My Donations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_donations}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-yellow-600 font-medium">{stats.pending_donations}</span>
              <span className="ml-1">pending</span>
              <span className="mx-2">•</span>
              <span className="text-green-600 font-medium">{stats.completed_donations}</span>
              <span className="ml-1">completed</span>
            </div>
          </div>
        </div>

        {/* Available Donors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Donors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available_donors_count}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Ready to help</p>
          </div>
        </div>

        {/* Urgent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent_requests_count}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Need immediate attention</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blood Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Blood Requests</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent requests found
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.patient_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.blood_group} • {request.units_needed} units
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency_display}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status_display}
                      </span>
                    </div>
                  </div>
                  {request.days_remaining !== null && (
                    <div className="mt-2">
                      <p className={`text-xs ${request.days_remaining <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                        {request.days_remaining > 0 
                          ? `${request.days_remaining} days remaining`
                          : request.days_remaining === 0 
                          ? 'Due today'
                          : 'Overdue'
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {recentRequests.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all requests →
              </button>
            </div>
          )}
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentDonations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent donations found
              </div>
            ) : (
              recentDonations.map((donation) => (
                <div key={donation.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {donation.patient_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {donation.blood_group} • {donation.units_donated} units
                      </p>
                      <p className="text-xs text-gray-400">
                        Donor: {donation.donor_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status_display}
                      </span>
                      {donation.urgency && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(donation.urgency)}`}>
                          {donation.urgency_display}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentDonations.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all donations →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Request
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Donors
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Requests
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Donation History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;