import React, { useState, useEffect } from "react";
import styles from "./BudgetCard.module.css";
import { toast, ToastContainer } from "react-toastify";
import { CreateBudgetModal } from "./CreateModal";
import { useNavigate } from "react-router-dom";

function BudgetCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBudgets = () => {
    setIsLoading(true);
    fetch("http://localhost:8080/budget/budgets", {
      credentials: "include", // Send cookies/session info
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          // Ensure default values if properties are missing
          const processedBudgets = data.data.map((budget) => ({
            ...budget,
            categoryAmount: budget.categoryAmount || 0,
            targetAmount: budget.targetAmount || 2000,
          }));
          setBudgets(processedBudgets);
        } else {
          console.error("Failed to load budgets:", data.message);
          setError("Failed to load budgets");
        }
      })
      .catch((err) => {
        console.error("Error loading budgets:", err);
        setError("Error loading budgets. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Fetch budgets from the backend on component mount
    fetchBudgets();
  }, []);

  // Handle adding a new budget
  const handleAddBudget = (newBudget) => {
    // First, close the modal
    setIsModalOpen(false);
    
    // Show success toast when budget is added
    toast.success(`Budget "${newBudget.categoryName}" created successfully!`);
    
    // Refresh the budgets from the server to get the actual amounts
    fetchBudgets();
  };

  // Navigate to budget details with budget ID
  const navigateToBudgetDetails = (budget) => {
    navigate(`/budgetdetails/${budget.budgetID}`, { state: { budget } });
  };

  // Calculate progress color based on percentage - updated to match BudgetDetails logic
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
          No budgets found. Create your first budget!
        </div>
      ) : (
        budgets.map((budget) => (
          <div
            key={budget.budgetID}
            className={styles.card}
            onClick={() => navigateToBudgetDetails(budget)}
          >
            <div className={styles.iconWrapper}>
              <img
                src={budget.icon || "/default-icon.svg"}
                alt={budget.categoryName}
                width={50}
                height={50}
              />
            </div>
            <div className={styles.contentContainer}>
              <div className={styles.title}>{budget.categoryName}</div>
              <div className={styles.description}>
                RM {budget.categoryAmount.toLocaleString()} / RM{" "}
                {budget.targetAmount.toLocaleString()}
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={`${styles.progressBar} ${getProgressColor(budget.categoryAmount, budget.targetAmount)}`}
                  style={{
                    width: `${Math.min(100, (budget.categoryAmount / budget.targetAmount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))
      )}

      {/* Button to create new budget */}
      <section className={styles.createBudgetButton}>
        <button
          className={styles.addBudgetButton}
          onClick={() => setIsModalOpen(true)}
        >
          <img src="/add-icon.svg" alt="Add" />
          <span>Create New Budget</span>
        </button>
      </section>

      {/* Modal for creating a new budget */}
      {isModalOpen && (
        <CreateBudgetModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddBudget}
        />
      )}
    </div>
  );
}

export default BudgetCard;