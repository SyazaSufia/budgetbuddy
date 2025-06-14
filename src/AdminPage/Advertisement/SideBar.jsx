import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import SignOutModal from "../../SignOut/SignOutModal";
import { adminAPI } from "../../services/AdminApi";

const menuItems = [
  { id: "statistic", label: "Statistic", icon: "/stats-icon.svg", path: "/adminStats"},
  { id: "users", label: "Users", icon: "/profile-icon.svg", path: "/adminUser"},
  { id: "community", label: "Community", icon: "/community-icon.svg", path: "/adminCommunity" },
  { id: "advertisement", label: "Advertisement", icon: "/ads-icon.svg", path: "/adminAds", active: true }
];

export function SideBar({ onSignOut, onToggleCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  // When collapse state changes, notify parent component
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse(isCollapsed);
    }
  }, [isCollapsed, onToggleCollapse]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openSignOutModal = () => {
    setIsSignOutModalOpen(true);
  };

  const closeSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Call the centralized API for sign out
      await adminAPI.auth.signOut();

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
      // Even if the API call fails, still clear local data and redirect
      localStorage.removeItem("authToken");
      setIsSignOutModalOpen(false);
      
      if (onSignOut) {
        onSignOut();
      }
      
      navigate("/");
      window.location.reload();
    } finally {
      setIsSigningOut(false);
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(item.path);
                  }
                }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openSignOutModal();
                }
              }}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSidebar();
            }
          }}
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
        isLoading={isSigningOut}
      />
    </>
  );
}

export default SideBar;