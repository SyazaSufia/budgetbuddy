import { createContext, useContext, useState } from "react";
import { authAPI } from "./services/UserApi";

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
      await authAPI.signOut(); // Use consistent API
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      setUser(null); // Clear user even if logout fails
    }
  };

  const checkAuthStatus = async () => {
    if (authChecked) return;
    
    try {
      setLoading(true);
      const data = await authAPI.checkAuth(); // Use consistent API
      
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