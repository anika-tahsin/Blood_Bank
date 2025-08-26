import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
//import serializers;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem("access") || null);
  const [refresh, setRefresh] = useState(localStorage.getItem("refresh") || null);

  // axios instance
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
  });

  // attach token to all requests
  api.interceptors.request.use((config) => {
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  });

  // login with email + password
  const login = async (username, password) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/accounts/token/", {
        email,
        password,
      });

      const { access, refresh, user } = res.data;

      // save tokens
      setAccess(access);
      setRefresh(refresh);
      setUser(user);

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return true;
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      return false;
    }
  };

  // logout
  const logout = () => {
    setAccess(null);
    setRefresh(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  // load user from localStorage when page refreshes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
