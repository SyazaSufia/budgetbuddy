import React, { useState, useEffect } from "react";
import styles from "./AddModal.module.css";
import { toast } from "react-toastify"; // Make sure this is imported

export const EditExpenseModal = ({ onClose, onEdit, expense }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form fields with the expense data
  useEffect(() => {
    if (expense) {
      setTitle(expense.title || "");
      setAmount(expense.amount ? expense.amount.toString() : "");
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    if (!expense || !expense.expenseID) {
      alert("No expense selected for editing!");
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
      };

      // Updated endpoint to match the new route structure
      const response = await fetch(
        `http://localhost:8080/expenses/${expense.expenseID}`,
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
        };

        // Call the parent component's handler with the updated expense
        onEdit(updatedExpense);

        // Close modal
        onClose();
      } else {
        console.error("Error response:", result);
        alert("Error updating expense: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error caught:", error);
      alert("Error updating expense: " + error.message);
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
      // Fetch the budget information for this category - using the route from budgetRoutes
      const response = await fetch(
        `http://localhost:8080/categories/${categoryId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.log("No budget set for this category");
        return true; // No budget restrictions if there's no budget
      }

      const budgetData = await response.json();

      if (!budgetData.success || !budgetData.data) {
        console.log("No budget data available");
        return true; // Proceed if no budget data
      }

      const { categoryAmount, targetAmount } = budgetData.data;

      // For editing, we need to subtract the existing amount first
      const currentAmount =
        parseFloat(categoryAmount) - parseFloat(existingAmount);

      // Calculate what the new total would be
      const newTotal = currentAmount + parseFloat(newExpenseAmount);

      // Calculate percentage of budget that would be used
      const budgetPercentage = (newTotal / parseFloat(targetAmount)) * 100;

      if (budgetPercentage >= 100) {
        // Budget would be exceeded
        toast.error(
          `Warning: This expense will exceed your budget limit! 
           You'll be RM${(newTotal - targetAmount).toFixed(2)} over budget.`,
          { autoClose: false }
        );

        // Still allow the transaction to proceed
        return true;
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>Edit Expense</div>
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