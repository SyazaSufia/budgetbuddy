import React, { useState } from "react";
import styles from "./Budget.module.css";
import SidebarNav from "./SideBar";
import BudgetCard from "./BudgetCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Budget({ user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className={`${styles.container} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.content}>
          <h1 className={styles.greeting}>Hello, {user ? user.name : "Guest"}!</h1>
          <div className={styles.budgetSection}>
            <div className={styles.budgetList}>
              <BudgetCard />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Budget;