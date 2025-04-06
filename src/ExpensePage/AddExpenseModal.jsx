import React, { useState } from "react";
import styles from "./AddModal.module.css";

export const AddExpenseModal = ({ onClose, onAdd, categoryId }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !amount) {
      alert("Please fill in all fields.");
      return;
    }
  
    if (!categoryId) {
      alert("No category selected!");
      console.error("Missing categoryId for expense");
      return;
    }
  
    const date = new Date().toISOString().split("T")[0];
  
    try {
      console.log("Submitting expense with categoryId:", categoryId);
      const payload = {
        category: categoryId,
        title: trimmedTitle,
        amount: parseFloat(amount),
        date,
      };
      console.log("Payload:", payload);
  
      const response = await fetch("http://localhost:8080/expense/expense", {
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
        
        // Create new expense object with the data we have
        const newExpense = {
          expenseID: result.insertId || Date.now(), // Use the ID from server if available
          categoryID: categoryId,
          title: trimmedTitle,
          amount: parseFloat(amount),
          date,
        };
        
        // Call the parent component's handler with the new expense
        onAdd(newExpense);
        
        // Close modal
        onClose();
      } else {
        console.error("Error response:", result);
        alert("Error adding expense: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error caught:", error);
      alert("Error adding expense: " + error.message);
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
