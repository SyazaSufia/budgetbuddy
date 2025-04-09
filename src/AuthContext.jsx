import { createContext, useContext, useState } from "react";

// Create authentication context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Track if auth has been checked
  
  const login = (userData) => setUser(userData);
  
  const logout = async () => {
    try {
      await fetch("http://localhost:8080/sign-out", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkAuthStatus = async () => {
    // Only check if we haven't checked before
    if (authChecked) return;
    
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/check-auth", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setAuthChecked(true); // Mark that we've checked auth
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
      setAuthChecked(true); // Mark that we've checked auth even if it failed
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