import React, { useState, useEffect } from "react";
import styles from "./BudgetCard.module.css";
import { toast } from "react-toastify";
import { CreateBudgetModal } from "./CreateModal";
import { useNavigate } from "react-router-dom";
import BudgetIndicator from "./BudgetIndicator";
import { budgetAPI } from "../services/UserApi";

function BudgetCard({ activeTimeFilter = 'month' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetExpenses, setBudgetExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

      {/* Render each budget as a card */}
      {budgets.length === 0 ? (
        <div className={styles.noBudgets}>
          <img
            src="/empty-illustration.svg"
            alt="No budgets"
            className={styles.emptyIllustration}
          />
          <p>No budgets found for this time period. 
            {!isReadOnlyMode && " Create a new budget!"}
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

      {/* Only show Create New Budget button when not in read-only mode */}
      {!isReadOnlyMode && (
        <section className={styles.createBudgetButton}>
          <button
            className={styles.addBudgetButton}
            onClick={() => setIsModalOpen(true)}
          >
            <img src="/add-icon.svg" alt="Add" />
            <span>Create New Budget</span>
          </button>
        </section>
      )}

      {/* Modal for creating a new budget - only functional when not in read-only mode */}
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