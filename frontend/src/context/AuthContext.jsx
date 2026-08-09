import { createContext, useContext, useEffect, useState } from "react";

import { loginUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("velocyte_access_token"),
  );

  const [loading, setLoading] = useState(true);

  // =====================================
  // LOAD USER WHEN APP STARTS
  // =====================================

  useEffect(() => {
    const loadUser = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(accessToken);

        setUser(currentUser);
      } catch (error) {
        console.error("Authentication failed:", error);

        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [accessToken]);

  // =====================================
  // LOGIN
  // =====================================

  const login = async (email, password) => {
    const data = await loginUser({
      email,
      password,
    });

    localStorage.setItem("velocyte_access_token", data.access_token);

    localStorage.setItem("velocyte_refresh_token", data.refresh_token);

    setAccessToken(data.access_token);

    setUser(data.user);

    return data;
  };

  // =====================================
  // LOGOUT
  // =====================================

  const logout = () => {
    localStorage.removeItem("velocyte_access_token");

    localStorage.removeItem("velocyte_refresh_token");

    setAccessToken(null);

    setUser(null);
  };

  // =====================================
  // AUTH CONTEXT VALUE
  // =====================================

  const value = {
    user,

    accessToken,

    isAuthenticated: !!accessToken,

    loading,

    login,

    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =====================================
// CUSTOM HOOK
// =====================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
