import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, logout };
}
