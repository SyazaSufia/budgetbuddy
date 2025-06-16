import React, { useState, useEffect } from "react";
import styles from "./BudgetCard.module.css";
import { toast } from "react-toastify";
import { CreateBudgetModal } from "./CreateModal";
import { useNavigate } from "react-router-dom";
import BudgetIndicator from "./BudgetIndicator";
import { budgetAPI, incomeAPI } from "../services/UserApi";

function BudgetCard({ activeTimeFilter = 'month' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetExpenses, setBudgetExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomeInfo, setIncomeInfo] = useState(null);
  const navigate = useNavigate();

  // Check if the current filter allows editing (only "thisMonth" allows editing)
  const isReadOnlyMode = activeTimeFilter !== 'thisMonth';

  // Map Dashboard period values to BudgetCard expected values
  const mapPeriodFilter = (dashboardPeriod) => {
    const periodMap = {
      'month': 'thisMonth',
      'lastMonth': 'lastMonth', 
      'year': 'thisYear',
      'last12Months': 'last12Months'
    };
    return periodMap[dashboardPeriod] || 'thisMonth';
  };

  // Check if user has income for current month (only when not in read-only mode)
  const checkCurrentMonthIncome = async () => {
    if (isReadOnlyMode) return; // Skip income check for historical data
    
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const incomeCheck = await incomeAPI.checkMonthlyIncomeExists(currentMonth, currentYear);
      
      if (incomeCheck.success) {
        setIncomeInfo({
          hasIncome: incomeCheck.data.hasIncome,
          totalIncome: incomeCheck.data.totalIncome,
          month: currentMonth,
          year: currentYear
        });
      }
    } catch (err) {
      console.error("Error checking income:", err);
      setIncomeInfo({ hasIncome: false, totalIncome: 0 });
    }
  };

  const fetchBudgets = async (timeFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Map the period before sending to API
      const mappedFilter = mapPeriodFilter(timeFilter);
      
      // Use your centralized budgetAPI - you might need to extend it to support timeFilter
      const data = await budgetAPI.getBudgets(mappedFilter);
      
      if (data.success) {
        // Ensure default values if properties are missing
        const processedBudgets = data.data.map((budget) => ({
          ...budget,
          targetAmount: budget.targetAmount || 2000,
        }));
        setBudgets(processedBudgets);
        
        // Fetch detailed information for each budget
        processedBudgets.forEach(budget => {
          fetchBudgetDetails(budget.budgetID, mappedFilter);
        });
      } else {
        console.error("Failed to load budgets:", data.message);
        setError("Failed to load budgets");
      }
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError(err.message || "Error loading budgets. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed budget information including categories
  const fetchBudgetDetails = async (budgetID, timeFilter) => {
    try {
      // You'll need to add this method to your budgetAPI
      const data = await budgetAPI.getBudgetDetails(budgetID, timeFilter);
      
      if (data.success) {
        // Calculate total expenses for this budget from its categories
        const totalSpent = data.data.categories.reduce(
          (sum, category) => sum + parseFloat(category.categoryAmount || 0), 
          0
        );
        
        // Update budget expenses state with the calculated total
        setBudgetExpenses(prev => ({
          ...prev,
          [budgetID]: totalSpent
        }));
      }
    } catch (err) {
      console.error(`Error fetching details for budget ${budgetID}:`, err);
    }
  }; 

  useEffect(() => {
    // Check income for current month when component mounts or filter changes
    checkCurrentMonthIncome();
    
    // Fetch budgets with the active time filter
    fetchBudgets(activeTimeFilter);
  }, [activeTimeFilter]); // Re-fetch when activeTimeFilter changes

  // Handle adding a new budget (only works in edit mode)
  const handleAddBudget = (newBudget) => {
    if (isReadOnlyMode) return; // Prevent action in read-only mode
    
    // First, close the modal
    setIsModalOpen(false);

    // Show success toast when budget is added
    toast.success(`Budget "${newBudget.budgetName}" created successfully!`);

    // Refresh the budgets from the server to get the actual amounts
    fetchBudgets(activeTimeFilter);
    
    // Refresh income info to update available budget
    checkCurrentMonthIncome();
  };

  // Handle create budget button click with income validation
  const handleCreateBudgetClick = async () => {
    if (isReadOnlyMode) {
      toast.info("Creating budgets is only available for the current month.");
      return;
    }

    // Check if user has income for current month
    if (!incomeInfo || !incomeInfo.hasIncome) {
      toast.error("You must add income for this month before creating a budget. Please go to the Income section first.");
      return;
    }

    // If user has income, open the modal
    setIsModalOpen(true);
  };

  // Navigate to budget details with budget ID and read-only state
  const navigateToBudgetDetails = (budget) => {
    navigate(`/budgetdetails/${budget.budgetID}`, { 
      state: { 
        budget,
        isReadOnlyMode: isReadOnlyMode // Pass read-only state to details page
      } 
    });
  };

  // Calculate progress color based on percentage
  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;

    if (percentage <= 50) return styles.progressGreen;
    if (percentage <= 80) return styles.progressYellow;
    return styles.progressRed;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading budgets...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.cardContainer}>

      {/* Show income status banner when in current month mode */}
      {!isReadOnlyMode && (
        <div className={styles.incomeStatusBanner}>
          {incomeInfo && incomeInfo.hasIncome ? (
            <div className={styles.incomeSuccess}>
              <span className={styles.incomeIcon}>✓</span>
              Monthly Income: RM {incomeInfo.totalIncome.toFixed(2)}
            </div>
          ) : (
            <div className={styles.incomeWarning}>
              <span className={styles.incomeIcon}>⚠</span>
              No income added for this month. Add income first to create budgets.
            </div>
          )}
        </div>
      )}

      {/* Render each budget as a card */}
      {budgets.length === 0 ? (
        <div className={styles.noBudgets}>
          <img
            src="/empty-illustration.svg"
            alt="No budgets"
            className={styles.emptyIllustration}
          />
          <p>
            {!isReadOnlyMode && (!incomeInfo || !incomeInfo.hasIncome) 
              ? "Add income first, then create your first budget!"
              : isReadOnlyMode 
                ? "No budgets found for this time period."
                : "No budgets found for this time period. Create a new budget!"
            }
          </p>
        </div>
      ) : (
        budgets.map((budget) => {
          // Get the actual spent amount from our budgetExpenses state
          const spentAmount = budgetExpenses[budget.budgetID] || 0;
            
          return (
            <div
              key={budget.budgetID}
              className={styles.card}
              onClick={() => navigateToBudgetDetails(budget)}
            >
              <div className={styles.iconWrapper}>
                <img
                  src={budget.icon || "/default-icon.svg"}
                  alt={budget.budgetName}
                  width={50}
                  height={50}
                />
              </div>
              <div className={styles.contentContainer}>
                <div className={styles.title}>{budget.budgetName}</div>
                <div className={styles.description}>
                  RM {spentAmount.toLocaleString()} / RM{" "}
                  {budget.targetAmount.toLocaleString()}
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={`${styles.progressBar} ${getProgressColor(
                      spentAmount,
                      budget.targetAmount
                    )}`}
                    style={{
                      width: `${Math.min(
                        100,
                        (spentAmount / budget.targetAmount) * 100
                      )}%`,
                    }}
                  />
                </div>
                
                {/* Add BudgetIndicator component */}
                <BudgetIndicator 
                  currentAmount={spentAmount} 
                  targetAmount={budget.targetAmount} 
                />
              </div>
            </div>
          );
        })
      )}

      {/* Only show Create New Budget button when not in read-only mode and user has income */}
      {!isReadOnlyMode && (
        <section className={styles.createBudgetButton}>
          <button
            className={`${styles.addBudgetButton} ${
              (!incomeInfo || !incomeInfo.hasIncome) ? styles.disabledButton : ''
            }`}
            onClick={handleCreateBudgetClick}
            disabled={!incomeInfo || !incomeInfo.hasIncome}
            title={
              (!incomeInfo || !incomeInfo.hasIncome) 
                ? "Add income first to create budgets" 
                : "Create New Budget"
            }
          >
            <img src="/add-icon.svg" alt="Add" />
            <span>Create New Budget</span>
          </button>
          {(!incomeInfo || !incomeInfo.hasIncome) && (
            <div className={styles.helperText}>
              Add income first to create budgets
            </div>
          )}
        </section>
      )}

      {/* Modal for creating a new budget - only functional when not in read-only mode and user has income */}
      {isModalOpen && !isReadOnlyMode && (
        <CreateBudgetModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddBudget}
        />
      )}
    </div>
  );
}

export default BudgetCard;