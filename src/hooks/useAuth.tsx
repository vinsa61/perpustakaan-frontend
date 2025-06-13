"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to check and update auth state from localStorage
  const checkAuthState = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check initial auth state
    checkAuthState();
    setLoading(false);

    // Listen for storage changes (including from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        checkAuthState();
      }
    };

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Dispatch custom event to notify other useAuth instances
    window.dispatchEvent(new CustomEvent("auth-change"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // Dispatch custom event to notify other useAuth instances
    window.dispatchEvent(new CustomEvent("auth-change"));
  };

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };
}
