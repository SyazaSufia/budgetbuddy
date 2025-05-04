import { createContext, useContext, useState } from "react";
import { API_BASE_URL, fetchWithAuth } from "./config/api";

// Create authentication context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const login = (userData) => setUser(userData);
  
  const logout = async () => {
    try {
      await fetchWithAuth("/sign-out", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkAuthStatus = async () => {
    if (authChecked) return;
    
    try {
      setLoading(true);
      const response = await fetchWithAuth("/check-auth");
      
      if (!response.ok) {
        throw new Error(`Auth check failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
      setAuthChecked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuthStatus, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};