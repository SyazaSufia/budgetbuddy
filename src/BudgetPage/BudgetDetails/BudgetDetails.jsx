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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalExpanded, setGoalExpanded] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    fetch(`http://localhost:8080/budget/budgets/${budgetID}`, {
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

  const handleSetGoal = async () => {
    if (!targetAmount) return;

    setIsSubmittingGoal(true);
    try {
      const response = await fetch(
        `http://localhost:8080/budget/budgets/${budgetID}`,
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
        `http://localhost:8080/budget/budgets/${budgetID}`,
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

        {/* Categories section */}
        <div className={styles.categoriesSection}>
          <h2>Categories</h2>
          {categories.length === 0 ? (
            <div className={styles.noCategories}>No categories added yet</div>
          ) : (
            <div className={styles.categoriesList}>
              {categories.map((category) => (
                <div key={category.categoryID} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <img 
                      src={category.icon || "/default-icon.svg"} 
                      alt={category.categoryName}
                      className={styles.categoryIcon}
                    />
                    <div className={styles.categoryName}>{category.categoryName}</div>
                  </div>
                  <div className={styles.categoryAmount}>
                    RM {parseFloat(category.categoryAmount || 0).toLocaleString()}
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