import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { ActionCard } from './ActionCard';
import { ExpenseCategory } from './ExpenseCategory';
import { SideBar } from './SideBar';
import ExpensePieChart from './ExpensePieChart';
import BudgetCard from '../BudgetPage/BudgetCard';
import AdvertisementBanner from './AdvertisementBanner'; // Import the new component
import styles from './Dashboard.module.css';

export const Dashboard = ({ user }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    balance: '0.00',
    income: '0.00',
    expense: '0.00',
    expensesByCategory: [],
    period: 'month'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('month');

  const periods = [
    { id: 'month', label: 'This month' },
    { id: 'lastMonth', label: 'Last month' },
    { id: 'year', label: 'This year' },
    { id: 'last12Months', label: 'Last 12 months' }
  ];

  // Define a color map based on category names
  const categoryColorMap = {
    "Housing": "#4b6cb7",
    "Food & Groceries": "#41b883",
    "Shopping": "#FFD166",
    "Transportation": "#6A0572",
    "Entertainment": "#1A535C",
    "Healthcare": "#F25F5C",
    "Education": "#247BA0", 
    "Utilities": "#70C1B3",
    "Travel": "#B2DBBF",
    "Other": "#8898aa"
  };

  // Default colors for categories that don't match the map
  const defaultColors = [
    "#4b6cb7", "#41b883", "#FFD166", "#6A0572", 
    "#1A535C", "#F25F5C", "#247BA0", "#70C1B3", 
    "#B2DBBF", "#8898aa"
  ];

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Fetch dashboard data using fetch API
  const fetchDashboardData = async (period) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:8080/dashboard/summary?period=${period}`, {
        credentials: 'include', // Send session cookies
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Assign colors to categories since the backend isn't doing it
        if (data.data && data.data.expensesByCategory) {
          
          // Add colors to categories
          data.data.expensesByCategory = data.data.expensesByCategory.map((category, index) => {
            // Try to match by category name first
            let color = categoryColorMap[category.category];
            
            // If no match, use a color from the default array
            if (!color) {
              color = defaultColors[index % defaultColors.length];
            }
            
            return {
              ...category,
              color: color
            };
          });
        }
        
        setDashboardData(data.data);
        setActivePeriod(period);
      } else {
        setError(data.error || 'Failed to load dashboard data');
        console.error("Failed to fetch dashboard data:", data.error);
      }
    } catch (err) {
      setError(`Error connecting to server: ${err.message}`);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(activePeriod);
  }, []);

  // Dashboard card data
  const dashboardCards = [
    { 
      icon: '/balance-icon.svg', 
      title: 'Balance', 
      amount: dashboardData.balance
    },
    { 
      icon: '/income-icon.svg', 
      title: 'Total Income', 
      amount: dashboardData.income
    },
    { 
      icon: '/expense-icon.svg', 
      title: 'Total Expense', 
      amount: dashboardData.expense
    }
  ];

  // Action card data
  const actionCards = [
    {
      icon: '/add-income-icon.svg',
      title: 'Add income',
      description: 'Add an income manually',
      variant: 'income'
    },
    {
      icon: '/add-expense-icon.svg',
      title: 'Add expenses',
      description: 'Add an expense manually',
      variant: 'expense'
    }
  ];

  // Handle period change
  const handlePeriodChange = (period) => {
    fetchDashboardData(period);
  };

  return (
    <div className={styles.dashboard}>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Pass the toggle handler to the SideBar */}
        <SideBar onToggleCollapse={handleSidebarToggle} />

        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h2 className={styles.welcomeText}>Hello, {user ? user.name : "Guest"}!</h2>
            <div className={styles.periodSelector}>
              <div className={styles.periodButtons}>
                {periods.map(period => (
                  <button 
                    key={period.id}
                    className={`${styles.periodButton} ${activePeriod === period.id ? styles.active : ''}`}
                    onClick={() => handlePeriodChange(period.id)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Replace the old ad banner with our new component */}
          <AdvertisementBanner limit={3} showPlaceholder={true} />

          {isLoading ? (
            <div className={styles.loadingIndicator}>Loading dashboard data...</div>
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : (
            <>
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
                <div className={styles.expenseBudgetContainer}>
                  <div className={styles.expenseChart}>
                    <h3 className={styles.expenseTitle}>Expenses by category</h3>
                    <div className={styles.chartContent}>
                      {/* Pie chart with validated colors */}
                      <div className={styles.chartImage}>
                        <ExpensePieChart categories={dashboardData.expensesByCategory || []} />
                      </div>
                      <div className={styles.expenseList}>
                        {dashboardData.expensesByCategory && dashboardData.expensesByCategory.length > 0 ? (
                          dashboardData.expensesByCategory.map((category, index) => (
                            <ExpenseCategory 
                              key={index} 
                              color={category.color} // We've ensured this is set in fetchDashboardData
                              category={category.category}
                              percentage={category.percentage}
                              amount={category.amount}
                            />
                          ))
                        ) : (
                          <p>No expense data for this period</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Add BudgetCard component to the right of ExpenseChart */}
                  <div className={styles.budgetSection}>
                    <h3 className={styles.budgetTitle}>Budget Overview</h3>
                    <div className={styles.budgetList}>
                      <BudgetCard />
                      {/* You can add more budget cards here if needed */}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;