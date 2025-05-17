import React, { useState } from "react";
import styles from "./CommunityManagement.module.css";
import PostTable from "./PostTable";
import SidebarNav from "./SideBar";

function CommunityManagement() {
  const [filteredPosts, setFilteredPosts] = useState(null);

  return (
    <main className={styles.container}>
      <SidebarNav />
      <section className={styles.content}>
        <h1 className={styles.title}>Community Management</h1>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Community Posts</h2>
          </header>
          <PostTable initialPosts={filteredPosts} />
        </div>
      </section>
    </main>
  );
}

export default CommunityManagement;