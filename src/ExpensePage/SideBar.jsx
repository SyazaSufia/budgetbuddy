import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "/dashboard-icon.svg" , path: "/dashboard" },
  { id: "personal", label: "Personal", icon: "/profile-icon.svg", path: "/profile"},
  { id: "income", label: "Income", icon: "/income-icon.svg", path: "/income"},
  { id: "expenses", label: "Expenses", icon: "/expenses-icon.svg", path: "/expense", active: true },
  { id: "budget", label: "Budget", icon: "/budget-icon.svg", path: "/budget"},
  { id: "community", label: "Community", icon: "/community-icon.svg", path: "/community" }
];

export function SideBar({ onSignOut, onToggleCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleSignOut = async () => {
    try {
      // Call the signout API to clear cookies
      await fetch("http://localhost:8080/sign-out", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent
      });
  
      // Remove authentication data from local storage
      localStorage.removeItem("authToken");
  
      // Redirect to homepage and refresh
      navigate("/");
      window.location.reload(); // Forces a full page refresh
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };  

  return (
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
            <div key={item.id} className={`${styles.menuItem} ${item.active ? styles.menuItemActive : ""}`} role="button" tabIndex={0} onClick={() => navigate(item.path)}>
              <img src={item.icon} className={styles.menuIcon} alt={`${item.label} icon`} />
              {!isCollapsed && <div>{item.label}</div>}
            </div>
          ))}
          <div className={styles.menuItem} role="button" tabIndex={0} onClick={handleSignOut}>
            <img src="/signout-icon.svg" className={styles.menuIcon} alt="Sign Out icon" />
            {!isCollapsed && <div>Sign Out</div>}
          </div>
        </div>
      </div>
      <div className={styles.collapseButton} role="button" tabIndex={0} onClick={toggleSidebar}>
        {!isCollapsed && <div className={styles.collapseText}>Collapse</div>}
        <img src="/collapse-icon.svg" className={styles.collapseIcon} alt="Collapse sidebar" />
      </div>
    </nav>
  );
}

export default SideBar;