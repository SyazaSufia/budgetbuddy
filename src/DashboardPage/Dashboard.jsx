import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ActionCard } from './ActionCard';
import { ExpenseCategory } from './ExpenseCategory';
import { SideBar } from './SideBar';
import styles from './Dashboard.module.css';

const dashboardCards = [
  { icon: '/balance-icon.svg', title: 'Balance', amount: '350.00' },
  { icon: '/income-icon.svg', title: 'Income', amount: '1,000.00' },
  { icon: '/expense-icon.svg', title: 'Expense', amount: '650.00' }
];

const actionCards = [
  {
    icon: '/add-income-icon.svg',
    title: 'Add income',
    description: 'Create an income manually',
    variant: 'income'
  },
  {
    icon: '/add-expense-icon.svg',
    title: 'Add expenses',
    description: 'Create an expense manually',
    variant: 'expense'
  }
];

const expenseCategories = [
  { color: '#9E77ED', category: 'Food', percentage: '41.35', amount: '236.00' },
  { color: '#F04438', category: 'Shopping', percentage: '21.51', amount: '236.00' },
  { color: '#0BA5EC', category: 'Transportation', percentage: '13.47', amount: '236.00' },
  { color: '#17B26A', category: 'School', percentage: '3.35', amount: '236.00' },
  { color: '#4E5BA6', category: 'Entertainment', percentage: '9.97', amount: '236.00' }
];

export const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className={styles.dashboard}>
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Pass the toggle handler to the SideBar */}
        <SideBar onToggleCollapse={handleSidebarToggle} />

        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h2 className={styles.welcomeText}>Hello, Syaza!</h2>
            <div className={styles.periodSelector}>
              <div className={styles.periodButtons}>
                <button className={`${styles.periodButton} ${styles.active}`}>This month</button>
                <button className={styles.periodButton}>Last month</button>
                <button className={styles.periodButton}>This year</button>
                <button className={styles.periodButton}>Last 12 months</button>
              </div>
            </div>
          </header>

          <section className={styles.cardSection}>
            {dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </section>

          <section className={styles.actionSection}>
            {actionCards.map((card, index) => (
              <ActionCard key={index} {...card} />
            ))}
          </section>

          <section className={styles.expenseSection}>
            <div className={styles.expenseChart}>
              <h3 className={styles.expenseTitle}>Expenses by category</h3>
              <div className={styles.chartContent}>
                <img
                  loading="lazy"
                  src="/expense-pie-chart.svg"
                  alt="Expense distribution pie chart"
                  className={styles.chartImage}
                />
                <div className={styles.expenseList}>
                  {expenseCategories.map((category, index) => (
                    <ExpenseCategory key={index} {...category} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;