import { useState, useEffect } from "react";
import styles from "./CreateModal.module.css";
import { toast } from "react-toastify";
import { budgetAPI, categoryAPI, incomeAPI } from "../services/UserApi";

export const CreateBudgetModal = ({ onClose, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [targetAmount, setTargetAmount] = useState(2000);
  const [incomeInfo, setIncomeInfo] = useState(null);
  const [isCheckingIncome, setIsCheckingIncome] = useState(true);

  // These are our predefined budget types (matching the category options in AddCategoryModal)
  const categories = [
    { name: "Food & Groceries", icon: "/food-icon.svg" },
    { name: "Transportation", icon: "/transport-icon.svg" },
    { name: "Shopping", icon: "/shopping-icon.svg" },
    { name: "Entertainment", icon: "/entertainment-icon.svg" },
    { name: "Housing", icon: "/housing-icon.svg" },
    { name: "Subscriptions", icon: "/subscription-icon.svg" },
    { name: "Savings", icon: "/saving-icon.svg" },
    { name: "Others", icon: "/otherExpense-icon.svg" },
  ];

  // Check if user has income for current month when modal opens
  useEffect(() => {
    const checkIncomeAndBudgetInfo = async () => {
      try {
        setIsCheckingIncome(true);
        
        // Get current month/year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Check if user has income for current month
        const incomeCheck = await incomeAPI.checkMonthlyIncomeExists(currentMonth, currentYear);
        
        if (incomeCheck.success) {
          if (!incomeCheck.data.hasIncome) {
            setError("You must add income for this month before creating a budget.");
            setIncomeInfo({ hasIncome: false, totalIncome: 0 });
          } else {
            // Get budget summary to show available budget
            const budgetSummary = await budgetAPI.getBudgetSummary(currentMonth, currentYear);
            if (budgetSummary.success) {
              setIncomeInfo({
                hasIncome: true,
                totalIncome: incomeCheck.data.totalIncome,
                currentBudgetTotal: budgetSummary.data.monthlyBudgetTotal,
                availableBudget: budgetSummary.data.remainingBudget
              });
            } else {
              setIncomeInfo({
                hasIncome: true,
                totalIncome: incomeCheck.data.totalIncome,
                currentBudgetTotal: 0,
                availableBudget: incomeCheck.data.totalIncome
              });
            }
          }
        } else {
          setError("Unable to verify income information. Please try again.");
        }
      } catch (err) {
        console.error("Error checking income:", err);
        setError("Unable to verify income information. Please try again.");
      } finally {
        setIsCheckingIncome(false);
      }
    };

    checkIncomeAndBudgetInfo();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    const category = categories.find(cat => cat.name === categoryName);
    setSelectedCategory(category || "");
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setTargetAmount(amount);
    
    // Check if amount would exceed available budget
    if (incomeInfo && incomeInfo.hasIncome && amount > incomeInfo.availableBudget) {
      setError(`Budget amount (RM ${amount.toFixed(2)}) exceeds available budget (RM ${incomeInfo.availableBudget.toFixed(2)})`);
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has income
    if (!incomeInfo || !incomeInfo.hasIncome) {
      setError("You must add income for this month before creating a budget.");
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    if (selectedCategory.name === "Others" && !customCategoryName.trim()) {
      setError("Please enter a custom category name.");
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    // Check if amount would exceed available budget
    if (targetAmount > incomeInfo.availableBudget) {
      setError(`Budget amount (RM ${targetAmount.toFixed(2)}) exceeds available budget (RM ${incomeInfo.availableBudget.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const budgetName =
        selectedCategory.name === "Others"
          ? customCategoryName.trim()
          : selectedCategory.name;

      // Validate budget creation first
      const validation = await budgetAPI.validateBudgetCreation({
        budgetName,
        targetAmount: parseFloat(targetAmount)
      });

      if (!validation.success) {
        if (validation.code === "NO_INCOME") {
          setError("You must add income for this month before creating a budget.");
        } else if (validation.code === "EXCEEDS_INCOME") {
          setError(validation.message);
        } else {
          setError(validation.message || "Unable to create budget.");
        }
        return;
      }

      // Create budget using centralized API
      const budgetData = {
        budgetName,
        icon: selectedCategory.icon,
        targetAmount: parseFloat(targetAmount)
      };

      const budgetResult = await budgetAPI.addBudget(budgetData);

      if (budgetResult.success) {
        // Create the initial category that matches the budget
        const categoryData = {
          categoryName: budgetName,
          icon: selectedCategory.icon,
          budgetID: budgetResult.data.budgetID
        };

        try {
          // Use centralized categoryAPI instead of direct fetch
          const categoryResult = await categoryAPI.addCategory(categoryData);

          if (categoryResult.success) {
            // Successfully created both budget and initial category
            const updatedBudgetData = {
              ...budgetResult.data,
              categories: [categoryResult.data]
            };
            
            onAdd(updatedBudgetData);
            toast.success("Budget created successfully!");
            onClose();
          } else {
            setError("Budget created but failed to create category.");
          }
        } catch (categoryErr) {
          console.error("Error creating category:", categoryErr);
          setError("Budget created but failed to create category.");
        }
      } else {
        if (budgetResult.code === "NO_INCOME") {
          setError("You must add income for this month before creating a budget.");
        } else if (budgetResult.code === "EXCEEDS_INCOME") {
          setError(budgetResult.message);
        } else {
          setError(budgetResult.message || "Error creating budget.");
        }
      }
    } catch (err) {
      console.error("Error creating budget:", err);
      if (err.message.includes("NO_INCOME")) {
        setError("You must add income for this month before creating a budget.");
      } else if (err.message.includes("EXCEEDS_INCOME")) {
        setError("Budget amount would exceed your monthly income.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still checking income, show loading state
  if (isCheckingIncome) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles.modalTitle}>Create New Budget</h2>
          <div className={styles.loadingMessage}>Checking income information...</div>
        </div>
      </div>
    );
  }

  // If no income, show income requirement message
  if (incomeInfo && !incomeInfo.hasIncome) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles.modalTitle}>Income Required</h2>
          <div className={styles.errorMessage}>
            You must add income for this month before creating a budget.
          </div>
          <div className={styles.infoMessage}>
            Please go to the Income section and add your income first, then try creating a budget again.
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Create New Budget</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Type:
            </label>
            <select
              id="category"
              className={styles.select}
              value={selectedCategory?.name || ""}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a budget type</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory?.name === "Others" && (
            <div className={styles.formGroup}>
              <label htmlFor="customCategory" className={styles.label}>
                Title:
              </label>
              <input
                id="customCategory"
                type="text"
                className={styles.input}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="Enter custom budget name"
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="targetAmount" className={styles.label}>
              Amount:
            </label>
            <input
              id="targetAmount"
              type="number"
              className={styles.input}
              value={targetAmount}
              onChange={handleAmountChange}
              placeholder="Enter budget amount"
              min="1"
              max={incomeInfo ? incomeInfo.availableBudget : undefined}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={isSubmitting || !incomeInfo?.hasIncome}
            >
              {isSubmitting ? "Creating..." : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};