import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Import auth components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import VerifySuccess from './pages/VerifySuccess';
import VerifyError from './pages/VerifyError';
import VerifyRedirect from './pages/VerifyRedirect';

// Import dashboard components
import Dashboard from './pages/dashboard/Dashboard';
import Donors from './pages/dashboard/Donors';
// import Patients from './pages/dashboard/Patients';
// import Inventory from './pages/dashboard/Inventory';
import BloodRequests from './pages/dashboard/BloodRequests';
import DonationHistory from './pages/dashboard/DonationHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-success" element={<VerifySuccess />} />
            <Route path="verify-error" element={<VerifyError />} />
            <Route path="verify-redirect" element={<VerifyRedirect />} />
          </Route>

          {/* Email verification route with parameters */}
          <Route path="/verify/:uid/:token" element={<VerifyRedirect />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="donors" element={<Donors />} />
            {/* <Route path="patients" element={<Patients />} /> */}
            {/* <Route path="inventory" element={<Inventory />} /> */}
            <Route path="requests" element={<BloodRequests />} />
            <Route path="donations" element={<DonationHistory />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;