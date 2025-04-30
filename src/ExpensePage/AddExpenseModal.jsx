import React, { useState } from "react";
import styles from "./AddModal.module.css";
import { toast } from "react-toastify"; // Make sure this is imported

export const AddExpenseModal = ({
  onClose,
  onAdd,
  categoryId,
  updateCategoryAmount,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  // API base URLs with proper prefixes
  const API_BASE_URL = "http://localhost:8080";
  const CATEGORY_URL = (id) => `${API_BASE_URL}/budget/categories/${id}`;
  const ADD_EXPENSE_URL = `${API_BASE_URL}/expense/expenses`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    const shouldProceed = await checkBudgetLimits(categoryId, amount);
    if (!shouldProceed) return;

    if (!categoryId) {
      alert("No category selected!");
      console.error("Missing categoryId for expense");
      return;
    }

    const date = new Date().toISOString().split("T")[0];

    try {
      console.log("Submitting expense with categoryId:", categoryId);
      // Updated payload structure to match what the controller expects
      const payload = {
        categoryID: categoryId, // Changed from 'category' to 'categoryID'
        title: trimmedTitle,
        amount: parseFloat(amount),
        date,
      };
      console.log("Payload:", payload);

      // Updated endpoint with the correct prefixed URL
      const response = await fetch(ADD_EXPENSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Success response:", result);

        // Create new expense object with the data from the server response
        const newExpense = {
          expenseID: result.data.expenseID || Date.now(), // Use the ID from server if available
          categoryID: categoryId,
          title: trimmedTitle,
          amount: parseFloat(amount),
          date,
        };

        // Update the category amount optimistically
        if (updateCategoryAmount) {
          updateCategoryAmount(categoryId, amount);
        }

        // Call the parent component's handler with the new expense
        onAdd(newExpense);

        // Close modal
        onClose();
      } else {
        console.error("Error response:", result);
        alert("Error adding expense: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error caught:", error);
      alert("Error adding expense: " + error.message);
    }
  };

  // Check budget status and show appropriate notifications
  const checkBudgetLimits = async (
    categoryId,
    newExpenseAmount,
    existingAmount = 0
  ) => {
    try {
      // Fetch the category information using the correct URL with prefix
      const response = await fetch(CATEGORY_URL(categoryId), {
        credentials: "include",
      });

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
        <div className={styles.modalHeader}>Add Expense</div>
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
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.confirmButton}`}>
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;