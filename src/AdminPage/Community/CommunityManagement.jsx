import React from "react";
import styles from "./CommunityManagement.module.css";
import SearchBar from "./SearchBar";
import PostTable from "./PostTable";
import SidebarNav from "./SideBar";

function CommunityManagement() {
  return (
    <main className={styles.container}>
      <SidebarNav />
      <section className={styles.content}>
        <h1 className={styles.title}>Community Management</h1>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>User Accounts</h2>
            <SearchBar />
          </header>
          <PostTable />
        </div>
      </section>
    </main>
  );
}

export default CommunityManagement;
