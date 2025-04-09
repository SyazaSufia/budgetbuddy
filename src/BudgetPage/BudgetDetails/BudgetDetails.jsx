import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import styles from "./BudgetDetails.module.css";
import Sidebar from "../SideBar";
import BreadcrumbNav from "./BreadCrumbNav";
import { DeleteModal } from "./DeleteModal";

function BudgetDetails() {
  const { budgetID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [budgetDetails, setBudgetDetails] = useState({
    budget: location.state?.budget || {
      categoryName: "",
      categoryAmount: 0,
      targetAmount: 2000,
    },
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalExpanded, setGoalExpanded] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          categoryAmount: location.state.budget.categoryAmount || 0,
          targetAmount: location.state.budget.targetAmount || 2000,
        },
      }));
      setTargetAmount(location.state.budget.targetAmount || 2000);
    }

    // Fetch complete budget details including history
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
          // Ensure the data has proper defaults if values are missing
          const processedData = {
            budget: {
              ...data.data.budget,
              categoryAmount: data.data.budget.categoryAmount || 0,
              targetAmount: data.data.budget.targetAmount || 2000,
            },
            history: data.data.history || [],
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
        `http://localhost:8080/budget/budgets/${budgetID}/target`,
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
      } else {
        setError(data.message || "Failed to update target amount");
      }
    } catch (err) {
      console.error("Error updating target amount:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleDeleteBudget = async () => {
    setIsDeleting(true);
    try {
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
        // Using react-toastify
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

  if (isLoading && !budgetDetails.budget.categoryName) {
    return <div className={styles.loading}>Loading budget details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const { budget, history } = budgetDetails;
  const progressPercentage = Math.min(
    100,
    (budget.categoryAmount / budget.targetAmount) * 100
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
    <section className={styles.container}>
      <Sidebar className={styles.sidebar} />
      <div className={styles.content}>
        {/* Breadcrumb Nav Only */}
        <div className={styles.topNavSection}>
          <div className={styles.topNav}>
            <BreadcrumbNav
              categoryName={budget.categoryName || "Budget Details"}
            />
          </div>
        </div>

        <div className={styles.budgetHeader}>
          {budget.icon && (
            <img
              src={budget.icon}
              alt={budget.categoryName}
              className={styles.budgetIcon}
            />
          )}
          <h2 className={styles.budgetTitle}>{budget.categoryName}</h2>
        </div>

        {/* Budget progress bar */}
        <div className={styles.budgetProgress}>
          <div className={styles.budgetLabel}>
            Budget{" "}
            <span className={styles.budgetAmount}>
              {budget.categoryAmount} / {budget.targetAmount}
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

        {/* History section */}
        <div className={styles.historySection}>
          <h2>History</h2>
          {history.length === 0 ? (
            <div className={styles.noHistory}>No transaction history yet</div>
          ) : (
            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.expenseID} className={styles.historyItem}>
                  <div className={styles.historyDate}>{item.date}</div>
                  <div className={styles.historyAmount}>
                    RM {item.amount.toLocaleString()}
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
        />
      )}
    </section>
  );
}

export default BudgetDetails;
