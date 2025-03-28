import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./EditModal.module.css";

export const EditIncomeModal = ({ income, onClose, onUpdate }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedIncome = {
      type: income.type, // Keep original type (non-editable)
      amount: amount || income.amount, // Use updated amount or fallback to original
      date: income.date, // Keep original date
      title: income.title, // Keep original title
      source: income.source, // Keep original source
    };

    try {
      const response = await fetch(
        `http://localhost:8080/income/update/${income.incomeID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIncome),
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Income updated successfully!");
        onUpdate(updatedIncome); // Update income in parent component
        onClose();
      } else {
        toast.error(result.error || "Failed to update income.");
      }
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Edit Amount</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Type:</label>
            <input
              type="text"
              value={income.type} // Display the previous type
              className={styles.input}
              readOnly // Make the field non-editable
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Amount:</label>
            <input
              type="number"
              className={styles.input}
              placeholder={income.amount} // Placeholder shows current amount
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <button type="submit" className={styles.confirmButton}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncomeModal;