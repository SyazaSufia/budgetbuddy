import React, { useState } from "react";
import styles from "./Community.module.css";
import SidebarNav from "./SideBar";
import ForumFeed from "./ForumFeed";

function Community({ user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <main className={styles.communityDefault}>
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.main}>
          <ForumFeed user={user} />
        </section>
      </div>
    </main>
  );
}

export default Community;