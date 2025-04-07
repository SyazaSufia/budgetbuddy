import { createContext, useContext, useState } from "react";

// Create authentication context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial auth check is now handled only once in AppContent
  
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
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};