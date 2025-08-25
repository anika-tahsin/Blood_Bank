import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  // 🔹 Login function
  const loginUser = async (username, password) => {
    const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthTokens(data);
      setUser({ username }); // basic info, you can decode JWT for more
      localStorage.setItem("authTokens", JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  };

  // 🔹 Logout function
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
  };

  // 🔹 Auto login (if tokens exist)
  useEffect(() => {
    if (authTokens) {
      setUser({ username: "current_user" }); // (optional: decode token for real user)
    }
  }, [authTokens]);

  return (
    <AuthContext.Provider value={{ user, authTokens, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
            