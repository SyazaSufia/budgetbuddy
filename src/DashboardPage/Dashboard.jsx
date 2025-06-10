import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { ExpenseCategory } from './ExpenseCategory';
import { SideBar } from './SideBar';
import ExpensePieChart from './ExpensePieChart';
import BudgetCard from '../BudgetPage/BudgetCard';
import AdvertisementBanner from './AdvertisementBanner';
import { dashboardAPI } from '../services/UserApi';
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

  const defaultColors = [
    "#4b6cb7", "#41b883", "#FFD166", "#6A0572", 
    "#1A535C", "#F25F5C", "#247BA0", "#70C1B3", 
    "#B2DBBF", "#8898aa"
  ];

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Updated fetchDashboardData using API service
  const fetchDashboardData = async (period) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await dashboardAPI.getSummary(period);
      
      if (data.success) {
        // Add colors to categories
        if (data.data && data.data.expensesByCategory) {
          data.data.expensesByCategory = data.data.expensesByCategory.map((category, index) => {
            let color = categoryColorMap[category.category];
            
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
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
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

  const handlePeriodChange = (period) => {
    fetchDashboardData(period);
  };

  // Update the handleDownloadPDF function
  const handleDownloadPDF = async () => {
    try {
      const response = await dashboardAPI.downloadPDF(activePeriod);
      
      // Convert response to blob
      const blob = new Blob([response], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `dashboard-${activePeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      // Add user feedback
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className={styles.dashboard}>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SideBar onToggleCollapse={handleSidebarToggle} />

        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h2 className={styles.welcomeText}>Hello, {user ? user.name : "Guest"}!</h2>
            <div className={styles.pageActions}>
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
              <button 
                className={styles.downloadButton}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </button>
            </div>
          </header>

          <AdvertisementBanner limit={3} showPlaceholder={true} />

          {isLoading ? (
            <div className={styles.loadingIndicator}>Loading dashboard data...</div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={() => fetchDashboardData(activePeriod)}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <section className={styles.cardSection}>
                {dashboardCards.map((card, index) => (
                  <DashboardCard key={index} {...card} />
                ))}
              </section>

              <section className={styles.expenseSection}>
                <div className={styles.expenseBudgetContainer}>
                  <div className={styles.expenseChart}>
                    <h3 className={styles.expenseTitle}>Expenses by category</h3>
                    <div className={styles.chartContent}>
                      <div className={styles.chartImage}>
                        <ExpensePieChart categories={dashboardData.expensesByCategory || []} />
                      </div>
                      <div className={styles.expenseList}>
                        {dashboardData.expensesByCategory && dashboardData.expensesByCategory.length > 0 ? (
                          dashboardData.expensesByCategory.map((category, index) => (
                            <ExpenseCategory 
                              key={index} 
                              color={category.color}
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
                  
                  <div className={styles.budgetSection}>
                    <h3 className={styles.budgetTitle}>Budget Overview</h3>
                    <div className={styles.budgetList}>
                      {/* Pass the active period to BudgetCard using correct prop name */}
                      <BudgetCard activeTimeFilter={activePeriod} />
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