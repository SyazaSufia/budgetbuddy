import React, { useState, useEffect } from "react";
import styles from "./AddModal.module.css";
import { toast } from "react-toastify";

export const EditExpenseModal = ({ onClose, onEdit, expense }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // API endpoints
  const API_BASE_URL = "http://localhost:43210";
  const EXPENSE_URL = (id) => `${API_BASE_URL}/expense/expenses/${id}`;
  const CATEGORY_URL = (id) => `${API_BASE_URL}/budget/categories/${id}`;

  // Initialize form fields with the expense data
  useEffect(() => {
    if (expense) {
      setTitle(expense.title || "");
      setAmount(expense.amount ? expense.amount.toString() : "");
      
      // Format date for the date input (YYYY-MM-DD)
      if (expense.date) {
        // Handle different date formats
        const formattedDate = expense.date.includes('T') 
          ? expense.date.split('T')[0] 
          : expense.date;
        setDate(formattedDate);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !amount || !date) {
      setError("Please fill in all fields.");
      return;
    }

    if (!expense || !expense.expenseID) {
      setError("No expense selected for editing!");
      console.error("Missing expenseID for edit");
      return;
    }

    // Check budget limits first, accounting for the existing expense amount
    const shouldProceed = await checkBudgetLimits(
      expense.categoryID,
      amount,
      expense.amount
    );
    if (!shouldProceed) return;

    setIsSubmitting(true);

    try {
      // Updated payload to match what the controller expects
      const payload = {
        title: trimmedTitle,
        amount: parseFloat(amount),
        date: date
      };

      // Use the correct API endpoint
      const response = await fetch(
        EXPENSE_URL(expense.expenseID),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Create updated expense object
        const updatedExpense = {
          ...expense,
          title: trimmedTitle,
          amount: parseFloat(amount),
          date: date
        };

        // Call the parent component's handler with the updated expense
        onEdit(updatedExpense);
        toast.success("Expense updated successfully!");
        onClose();
      } else {
        console.error("Error response:", result);
        setError(result.message || "Error updating expense. Please try again.");
      }
    } catch (error) {
      console.error("Error caught:", error);
      setError("Error connecting to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check budget status and show appropriate notifications
  const checkBudgetLimits = async (
    categoryId,
    newExpenseAmount,
    existingAmount = 0
  ) => {
    try {
      // Fetch the category information - using the correct endpoint
      const response = await fetch(
        CATEGORY_URL(categoryId),
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.log("Could not fetch category information");
        return true; // No budget restrictions if we can't fetch info
      }

      const categoryData = await response.json();

      if (!categoryData.success || !categoryData.data) {
        console.log("No category data available");
        return true; // Proceed if no data
      }

      // Get the budget information for this category
      const fetchBudgetResponse = await fetch(
        `${API_BASE_URL}/budget/budgets/${categoryData.data.budgetID}`,
        {
          credentials: "include",
        }
      );

      if (!fetchBudgetResponse.ok) {
        console.log("Could not fetch budget information");
        return true;
      }

      const budgetData = await fetchBudgetResponse.json();
      
      if (!budgetData.success || !budgetData.data || !budgetData.data.budget) {
        console.log("No budget data available");
        return true;
      }

      const targetAmount = parseFloat(budgetData.data.budget.targetAmount || 0);
      const categoryAmount = parseFloat(categoryData.data.categoryAmount || 0);

      // For editing, we need to subtract the existing amount first
      const currentAmount = categoryAmount - parseFloat(existingAmount);

      // Calculate what the new total would be
      const newTotal = currentAmount + parseFloat(newExpenseAmount);

      // Only proceed with warnings if there's a valid budget target
      if (targetAmount <= 0) {
        return true;
      }

      // Calculate percentage of budget that would be used
      const budgetPercentage = (newTotal / targetAmount) * 100;

      if (budgetPercentage >= 100) {
        // Budget would be exceeded
        toast.error(
          `Warning: This expense will exceed your budget limit! 
           You'll be RM${(newTotal - targetAmount).toFixed(2)} over budget.`,
          { autoClose: 7000 }
        );

        // Ask for confirmation before proceeding
        const confirmProceed = window.confirm(
          "This expense will put you over budget. Do you want to proceed anyway?"
        );
        return confirmProceed;
      } else if (budgetPercentage >= 80) {
        // Budget is approaching the limit
        toast.warning(
          `You're approaching your budget limit! 
           This will bring you to ${budgetPercentage.toFixed(1)}% of your budget.`,
          { autoClose: 7000 }
        );
        return true;
      }

      // Budget is fine, proceed without warning
      return true;
    } catch (error) {
      console.error("Error checking budget limits:", error);
      return true; // On error, allow the transaction to proceed
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>Edit Expense</div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Title"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              placeholder="RM 0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.cancelButton}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.confirmButton}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};