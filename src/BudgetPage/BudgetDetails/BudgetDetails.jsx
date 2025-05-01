import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import styles from "./BudgetDetails.module.css";
import Sidebar from "../SideBar";
import BreadcrumbNav from "./BreadCrumbNav";
import { DeleteModal } from "./DeleteModal";
import BudgetIndicator from "../BudgetIndicator";

function BudgetDetails() {
  const { budgetID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [budgetDetails, setBudgetDetails] = useState({
    budget: location.state?.budget || {
      budgetName: "",
      targetAmount: 2000,
    },
    categories: []
  });
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [error, setError] = useState(null);
  const [goalExpanded, setGoalExpanded] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // API endpoints
  const API_BASE_URL = "http://localhost:8080";
  const BUDGET_DETAILS_URL = `${API_BASE_URL}/budget/budgets/${budgetID}`;
  const CATEGORY_EXPENSES_URL = (categoryId) => `${API_BASE_URL}/expense/categories/${categoryId}/expenses`;

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Calculate total amount spent across all categories
  const calculateTotalSpent = () => {
    return budgetDetails.categories.reduce((total, category) => 
      total + parseFloat(category.categoryAmount || 0), 0);
  };

  useEffect(() => {
    // If we don't have a budgetID, redirect to the budgets page
    if (!budgetID) {
      navigate("/budget");
      return;
    }

    // If we have data passed via navigation state, use it initially
    if (location.state?.budget) {
      setBudgetDetails((prev) => ({
        ...prev,
        budget: {
          ...location.state.budget,
          targetAmount: location.state.budget.targetAmount || 2000,
        },
      }));
      setTargetAmount(location.state.budget.targetAmount || 2000);
    }

    // Fetch complete budget details including categories
    fetch(BUDGET_DETAILS_URL, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          // Format the data properly
          const processedData = {
            budget: {
              ...data.data.budget,
              targetAmount: parseFloat(data.data.budget.targetAmount || 2000),
            },
            categories: data.data.categories || [],
          };
          setBudgetDetails(processedData);
          setTargetAmount(processedData.budget.targetAmount);
          
          // After loading categories, fetch expenses for each category
          fetchAllExpensesForBudget(data.data.categories || []);
        } else {
          setError(data.message || "Failed to load budget details");
        }
      })
      .catch((err) => {
        setError(`Error loading budget details: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [budgetID, location.state, navigate]);

  // Fetch expenses for all categories in this budget
  const fetchAllExpensesForBudget = async (categories) => {
    if (!categories || categories.length === 0) return;
    
    setIsLoadingExpenses(true);
    try {
      // Create an array of promises for fetching expenses for each category
      const expensePromises = categories.map(category => 
        fetch(CATEGORY_EXPENSES_URL(category.categoryID), {
          credentials: "include"
        })
        .then(res => {
          if (!res.ok) throw new Error(`Error fetching expenses for ${category.categoryName}`);
          return res.json();
        })
        .then(data => {
          if (data.success) {
            // Return expenses with category info added
            return data.data.map(expense => ({
              ...expense,
              categoryName: category.categoryName,
              categoryIcon: category.icon
            }));
          }
          return [];
        })
        .catch(err => {
          console.error(`Error fetching expenses for category ${category.categoryID}:`, err);
          return [];
        })
      );

      // Wait for all expense fetch promises to resolve
      const allCategoryExpenses = await Promise.all(expensePromises);
      
      // Flatten the array of arrays into a single array of expenses
      const allExpenses = allCategoryExpenses.flat();
      
      // Sort expenses by date (newest first)
      allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setExpenses(allExpenses);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleSetGoal = async () => {
    if (!targetAmount) return;

    setIsSubmittingGoal(true);
    try {
      const response = await fetch(
        BUDGET_DETAILS_URL,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ targetAmount: parseFloat(targetAmount) }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state with new target amount
        setBudgetDetails((prev) => ({
          ...prev,
          budget: {
            ...prev.budget,
            targetAmount: parseFloat(targetAmount),
          },
        }));
        setGoalExpanded(false);
        toast.success("Budget goal updated successfully!");
      } else {
        setError(data.message || "Failed to update target amount");
        toast.error(data.message || "Failed to update target amount");
      }
    } catch (err) {
      console.error("Error updating target amount:", err);
      setError(`Error: ${err.message}`);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleDeleteBudget = async () => {
    setIsDeleting(true);
    try {
      // Check if budget has categories
      if (budgetDetails.categories && budgetDetails.categories.length > 0) {
        toast.error("Cannot delete budget with associated categories. Delete categories first.");
        setShowDeleteModal(false);
        setIsDeleting(false);
        return;
      }

      const response = await fetch(
        BUDGET_DETAILS_URL,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Show toast notification for successful deletion
        toast.success("Budget deleted successfully");

        // Redirect to budget page after successful deletion
        navigate("/budget", {
          state: { message: "Budget deleted successfully" },
        });
      } else {
        setError(data.message || "Failed to delete budget");
        toast.error(data.message || "Failed to delete budget");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError(`Error: ${err.message}`);
      toast.error(`Error: ${err.message}`);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!budgetID) {
    return null; // Will redirect in useEffect
  }

  if (isLoading && !budgetDetails.budget.budgetName) {
    return <div className={styles.loading}>Loading budget details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const { budget, categories } = budgetDetails;
  const totalSpent = calculateTotalSpent();
  const progressPercentage = Math.min(
    100,
    (totalSpent / budget.targetAmount) * 100
  );

  let progressColorClass = "";

  if (progressPercentage <= 50) {
    progressColorClass = styles.green;
  } else if (progressPercentage <= 80) {
    progressColorClass = styles.yellow;
  } else {
    progressColorClass = styles.red;
  }

  return (
    <section className={`${styles.container} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar className={styles.sidebar} onToggleCollapse={handleSidebarToggle} />
      <div className={styles.content}>
        {/* Breadcrumb Nav Only */}
        <div className={styles.topNavSection}>
          <div className={styles.topNav}>
            <BreadcrumbNav
              budgetName={budget.budgetName || "Budget Details"}
            />
          </div>
        </div>

        <div className={styles.budgetHeader}>
          {budget.icon && (
            <img
              src={budget.icon}
              alt={budget.budgetName}
              className={styles.budgetIcon}
            />
          )}
          <h2 className={styles.budgetTitle}>{budget.budgetName}</h2>
        </div>

        {/* Add BudgetIndicator at the top of the budget details */}
        <div className={styles.budgetIndicatorContainer}>
          <BudgetIndicator 
            currentAmount={totalSpent} 
            targetAmount={budget.targetAmount} 
          />
        </div>

        {/* Budget progress bar */}
        <div className={styles.budgetProgress}>
          <div className={styles.budgetLabel}>
            Budget{" "}
            <span className={styles.budgetAmount}>
              RM {totalSpent.toLocaleString()} / RM {budget.targetAmount.toLocaleString()}
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={`${styles.progressBar} ${progressColorClass}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Set a Goal section */}
        <div className={styles.actionSection}>
          <div
            className={styles.actionHeader}
            onClick={() => setGoalExpanded(!goalExpanded)}
          >
            <div className={styles.actionLeft}>
              <div className={styles.actionIcon}>
                <img
                  src="/goal-icon.svg"
                  alt="icon"
                  className={styles.actionIconImage}
                />
              </div>
              <span>Set a Goal</span>
            </div>
            <img
              src="/chevron-right.svg"
              alt="chevron"
              className={`${styles.actionIconImage} ${
                goalExpanded ? styles.rotate : ""
              }`}
            />
          </div>

          {goalExpanded && (
            <div className={styles.actionContent}>
              <div className={styles.inputGroup}>
                <label>Amount</label>
                <span className={styles.separator}>:</span>
                <input
                  type="text"
                  value={`RM${targetAmount}`}
                  onChange={(e) => {
                    // Remove RM prefix and non-numeric characters
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setTargetAmount(value);
                  }}
                  placeholder="RM 0.00"
                  className={styles.amountInput}
                />
                <button
                  className={styles.confirmButton}
                  onClick={handleSetGoal}
                  disabled={isSubmittingGoal}
                >
                  {isSubmittingGoal ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Budget section */}
        <div className={styles.actionSection}>
          <div
            className={styles.actionHeader}
            onClick={() => setShowDeleteModal(true)}
          >
            <div className={styles.actionLeft}>
              <div className={styles.actionIcon}>
                <img
                  src="/delete-icon.svg"
                  alt="icon"
                  className={styles.actionIconImage}
                />
              </div>
              <span>Delete Budget</span>
            </div>
          </div>
        </div>

        {/* Expense History Section */}
        <div className={styles.historySection}>
          <h2>Expense History</h2>
          {isLoadingExpenses ? (
            <div className={styles.loadingExpenses}>Loading expense history...</div>
          ) : expenses.length === 0 ? (
            <div className={styles.noExpenses}>No expense history found</div>
          ) : (
            <div className={styles.expensesList}>
              {expenses.map((expense) => (
                <div key={expense.expenseID} className={styles.expenseItem}>
                  <div className={styles.expenseItemLeft}>
                    <img 
                      src={expense.categoryIcon || "/default-icon.svg"} 
                      alt={expense.categoryName}
                      className={styles.expenseIcon}
                    />
                    <div className={styles.expenseInfo}>
                      <div className={styles.expenseTitle}>{expense.title}</div>
                      <div className={styles.expenseMeta}>
                        <span className={styles.expenseCategory}>{expense.categoryName}</span>
                        <span className={styles.expenseDate}>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.expenseAmount}>
                    RM {parseFloat(expense.amount || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteBudget}
          isDeleting={isDeleting}
        />
      )}
    </section>
  );
}

export default BudgetDetails;