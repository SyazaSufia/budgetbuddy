import React, { useState } from "react";
import UserManagement from "./UserManagement";
import SidebarNav from "./SideBar";
import styles from "./InputDesign.module.css";

const InputDesign = () => {
  // Add state to track sidebar collapse (same as ads page)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar toggle
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <main className={styles.container}>
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
      </div>
      <section className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <UserManagement />
      </section>
    </main>
  );
};

export default InputDesign;