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
