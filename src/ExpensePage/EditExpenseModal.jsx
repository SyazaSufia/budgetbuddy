import React, { useState, useEffect } from "react";
import styles from "./AddModal.module.css";

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

    setIsSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        amount: parseFloat(amount),
      };

      const response = await fetch(`http://localhost:8080/expense/expense/${expense.expenseID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

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

export default EditExpenseModal;