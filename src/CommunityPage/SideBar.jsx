import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import SignOutModal from "../SignOut/SignOutModal";
import { authAPI } from "../services/UserApi";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "/dashboard-icon.svg", path: "/dashboard" },
  { id: "personal", label: "Personal", icon: "/profile-icon.svg", path: "/profile" },
  { id: "income", label: "Income", icon: "/income-icon.svg", path: "/income" },
  { id: "budget", label: "Budget", icon: "/budget-icon.svg", path: "/budget" },
  { id: "expenses", label: "Expenses", icon: "/expenses-icon.svg", path: "/expense" },
  { id: "community", label: "Community", icon: "/community-icon.svg", path: "/community", active: true }
];

export function SideBar({ onSignOut, onToggleCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const navigate = useNavigate();

  // When collapse state changes, notify parent component
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse(isCollapsed);
    }
  }, [isCollapsed, onToggleCollapse]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Call onToggleCollapse callback immediately to prevent delay
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  const openSignOutModal = () => {
    setIsSignOutModalOpen(true);
  };

  const closeSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      // Use the API method instead of direct fetch
      await authAPI.signOut();
  
      // Remove authentication data from local storage
      localStorage.removeItem("authToken");
  
      // Close the modal
      setIsSignOutModalOpen(false);
      
      // Call parent's onSignOut if provided
      if (onSignOut) {
        onSignOut();
      }
      
      // Redirect to homepage and refresh
      navigate("/");
      window.location.reload(); // Forces a full page refresh
    } catch (error) {
      console.error("Sign out failed:", error);
      // You might want to show an error toast here
    }
  };  

  return (
    <>
      <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <img src="/PrimaryLogo.svg" className={styles.logoImage} alt="BudgetBuddy Logo" />
            </div>
            {!isCollapsed && <div className={styles.brandName}>BUDGETBUDDY<span className={styles.brandNameHighlight}>.</span></div>}
          </div>
          <div className={styles.menuList}>
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className={`${styles.menuItem} ${item.active ? styles.menuItemActive : ""}`} 
                role="button" 
                tabIndex={0}
                onClick={() => navigate(item.path)}
              >
                <img src={item.icon} className={styles.menuIcon} alt={`${item.label} icon`} />
                {!isCollapsed && <div>{item.label}</div>}
              </div>
            ))}
            <div 
              className={styles.menuItem} 
              role="button" 
              tabIndex={0} 
              onClick={openSignOutModal}
            >
              <img src="/signout-icon.svg" className={styles.menuIcon} alt="Sign Out icon" />
              {!isCollapsed && <div>Sign Out</div>}
            </div>
          </div>
        </div>
        <div 
          className={styles.collapseButton} 
          role="button" 
          tabIndex={0} 
          onClick={toggleSidebar}
        >
          {!isCollapsed && <div className={styles.collapseText}>Collapse</div>}
          <img src="/collapse-icon.svg" className={styles.collapseIcon} alt="Collapse sidebar" />
        </div>
      </nav>
      
      {/* Sign Out Modal */}
      <SignOutModal 
        isOpen={isSignOutModalOpen}
        onClose={closeSignOutModal}
        onConfirm={handleSignOut}
      />
    </>
  );
}

export default SideBar;