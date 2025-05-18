import React, { useState } from "react";
import StatsManagement from "./StatsManagement";
import SidebarNav from "./SideBar";
import styles from "./StatsPage.module.css";

const StatsPage = () => {
  // Add state to track sidebar collapse
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
        <StatsManagement />
      </section>
    </main>
  );
};

export default StatsPage;