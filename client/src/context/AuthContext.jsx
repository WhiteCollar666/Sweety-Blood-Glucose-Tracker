
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sweety_user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", credentials);

      // Adjust these fields if your controller uses a different response shape.
      const payload = response.data.data || response.data;
      const token = payload.token;
      const loggedInUser = payload.user;

      if (!token || !loggedInUser) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("sweety_token", token);
      localStorage.setItem("sweety_user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/register", details);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
