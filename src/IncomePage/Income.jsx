import React, { useState } from "react";
import styles from "./Income.module.css";
import SidebarNav from "./SideBar";
import IncomeList from "./IncomeList";

export default function IncomeLayout({ user }) {
  const [totalIncome, setTotalIncome] = useState(0); // State for total income
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <main className={styles.incomeDefault}>
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.main}>
          <header className={styles.headerSection}>
            <h1 className={styles.pageHeader}>
              Hello, {user ? user.name : "Guest"}!
            </h1>
          </header>

          <section className={styles.content3}>
            <form className={styles.totalIncome}>
              <label htmlFor="totalIncome" className={styles.labelM}>
                Total Income
              </label>
              <div className={styles.inputC}>
                <div className={styles.inputM}>
                  <input
                    id="totalIncome"
                    type="text"
                    className={styles.placeholder}
                    value={`RM ${totalIncome.toFixed(2)}`}
                    readOnly
                    aria-label="Total Income Amount"
                  />
                </div>
              </div>
            </form>

            {/* Pass the callback to update total income */}
            <IncomeList onUpdateTotalIncome={setTotalIncome} />
          </section>
        </section>
      </div>
    </main>
  );
}