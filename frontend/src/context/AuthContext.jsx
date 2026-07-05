import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("k2c_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("k2c_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("k2c_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    // Registration no longer logs the user in immediately — the backend now
    // requires email verification first. This returns { requiresVerification, email }.
    const res = await api.post("/auth/register", payload);
    return res.data;
  };

  const verifyEmail = async (email, code) => {
    const res = await api.post("/auth/verify-email", { email, code });
    localStorage.setItem("k2c_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const resendVerification = async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("k2c_token");
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, verifyEmail, resendVerification, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
