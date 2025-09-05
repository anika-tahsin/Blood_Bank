import axios from "axios";


// Environment-based API URL
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://127.0.0.1:8000/api/'
  : '/api/'; // Use proxy in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // "https://blood-bank-backend-upcq.onrender.com/api/",
});

# PRODUCTION DEPLOYMENT ISSUES & FIXES

# Since it works locally but fails on Render, these are the specific issues:

# =============================================================================
# ISSUE 1: Environment-Specific Configuration Not Applied
# =============================================================================

# Problem: Your local settings work, but production settings are wrong

# Fix 1: Update backend/backend/settings.py
import os

# Environment-based configuration
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

if DEBUG:
    # Local development
    FRONTEND_URL = "http://localhost:5173"
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']
else:
    # Production
    FRONTEND_URL = "https://blood-bank-frontend-2qog.onrender.com"
    ALLOWED_HOSTS = [
        'blood-bank-backend-upcq.onrender.com',
        'localhost',
        '127.0.0.1',
    ]

# CORS settings - environment specific
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://blood-bank-frontend-2qog.onrender.com",
        "http://localhost:5173",  # Keep for local testing
    ]

CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# ISSUE 2: Frontend API Configuration Wrong in Production
# =============================================================================

# Problem: Your axios.js points to localhost even in production

# Fix 2: Update frontend/src/api/axios.js
import axios from 'axios';

// Environment-based API URL
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://127.0.0.1:8000/api/'
  : '/api/'; // Use proxy in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Debug logging
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', API_BASE_URL);

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem("access_token"); // 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    Promise.reject(error)
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data || error.message);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token"); // 
        if (refreshToken) {
          const response = await axios.post("https://blood-bank-backend-upcq.onrender.com/api/token/refresh/", {
            refresh: refreshToken,
          });

          const newToken = response.data.access;
          localStorage.setItem("access_token", newToken);

          // retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
