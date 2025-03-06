import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e241a8dab1f833b2821ad6ecfa9e4b23993cabeadffca36ce5874ecfb53d3f91?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" },
  { id: "personal", label: "Personal", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/963a326ca41bb95d5d837b86e4206d44a8e7a7bea5c67ea020e6363e08ec9b82?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0", active: true },
  { id: "income", label: "Income", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bba2e443cbe30473fb65d208d1c86b7205bafbfadeb10c70b8966a75a48fcc46?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" },
  { id: "expenses", label: "Expenses", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d4fa6c4a11cda45e24e4b0532813870101b98414663398a6f6e2e5e25b8b879e?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" },
  { id: "budget", label: "Budget", icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/38276d56a28861e37b45c2ae2ccac4a4613d8c4b8da51f23e2ecac3890228b9c?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" }
];

export function SideBar({ onSignOut }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

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
            <div key={item.id} className={`${styles.menuItem} ${item.active ? styles.menuItemActive : ""}`} role="button" tabIndex={0}>
              <img src={item.icon} className={styles.menuIcon} alt={`${item.label} icon`} />
              {!isCollapsed && <div>{item.label}</div>}
            </div>
          ))}
          <div className={styles.menuItem} role="button" tabIndex={0} onClick={handleSignOut}>
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/afb8b8ef1eca70dd93d4c651336d90859042016c6f0d1afa35bb38a6c5c60c57?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" className={styles.menuIcon} alt="Sign Out icon" />
            {!isCollapsed && <div>Sign Out</div>}
          </div>
        </div>
      </div>
      <div className={styles.collapseButton} role="button" tabIndex={0} onClick={toggleSidebar}>
        {!isCollapsed && <div className={styles.collapseText}>Collapse</div>}
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/be5ee1c31e7eba1ab31a153b93b584870b40c663a9c37464fab21e0716e2cf54?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" className={styles.collapseIcon} alt="Collapse sidebar" />
      </div>
    </nav>
  );
}

export default SideBar;