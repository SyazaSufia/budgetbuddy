import React, { useState } from "react";
import styles from "./Income.module.css";
import SidebarNav from "./SideBar";
import IncomeList from "./IncomeList";
import TimeFilter from "./TimeFilter";

export default function IncomeLayout({ user }) {
  const [totalIncome, setTotalIncome] = useState(0); // State for total income
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("thisMonth"); // Default filter
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger refresh

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  // Function to trigger refresh
  const handleRefreshIncomeList = () => {
    setRefreshTrigger((prev) => prev + 1); // Increment to trigger refresh
  };

  return (
    <main className={styles.incomeDefault}>
      <div
        className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
      >
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.main}>
          <header className={styles.headerSection}>
            <h1 className={styles.pageHeader}>
              Hello, {user ? user.name : "Guest"}!
            </h1>
            <div className={styles.filterContainer}>
              {/* Add TimeFilter component at the top right */}
              <TimeFilter
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
              />
            </div>
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

            {/* Pass the callback to update total income and the active filter */}
            <IncomeList
              onUpdateTotalIncome={setTotalIncome}
              activeFilter={activeFilter}
              refreshTrigger={refreshTrigger} // Pass refresh trigger prop
              onRefresh={handleRefreshIncomeList} // Pass refresh function
            />
          </section>
        </section>
      </div>
    </main>
  );
}
