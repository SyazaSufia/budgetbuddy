import React, { useState } from "react";
import AdvertisementManagement from "./AdsManagement";
import SidebarNav from "./SideBar";
import styles from "./AdsPage.module.css";

const AdvertisementPage = () => {
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
        <AdvertisementManagement />
      </section>
    </main>
  );
};

export default AdvertisementPage;