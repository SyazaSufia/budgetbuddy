import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./EditModal.module.css";

export const EditIncomeModal = ({ income, onClose, onUpdate }) => {
  const [amount, setAmount] = useState("");
  const [occurrence, setOccurrence] = useState(income.occurrence || "once");
  const [updateAllRecurrences, setUpdateAllRecurrences] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedIncome = {
      type: income.type, // Keep original type (non-editable)
      amount: amount || income.amount, // Use updated amount or fallback to original
      date: income.date, // Keep original date
      title: income.title, // Keep original title
      source: income.source, // Keep original source
      occurrence: occurrence, // Add occurrence to the update
      updateAllRecurrences: income.isRecurring ? updateAllRecurrences : false, // Only send if it's recurring
    };

    try {
      const response = await fetch(
        `http://localhost:43210/income/update/${income.incomeID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIncome),
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Show different toast messages based on what was updated
        if (amount && occurrence !== income.occurrence) {
          toast.success("Amount and occurrence updated successfully!");
        } else if (amount) {
          toast.success("Amount updated successfully!");
        } else if (occurrence !== income.occurrence) {
          toast.success("Occurrence updated successfully!");
        } else if (updateAllRecurrences) {
          toast.success("Future occurrences updated successfully!");
        } else {
          toast.success("Income updated successfully!");
        }
        
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
        <h2 className={styles.modalTitle}>Edit Income</h2>
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
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Occurrence:</label>
            <select
              className={styles.input}
              value={occurrence}
              onChange={(e) => setOccurrence(e.target.value)}
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          {/* Show this checkbox only for recurring incomes */}
          {income.isRecurring && (
            <div className={styles.formGroup}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="updateAllRecurrences"
                  checked={updateAllRecurrences}
                  onChange={(e) => setUpdateAllRecurrences(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="updateAllRecurrences" className={styles.checkboxLabel}>
                  Update all future occurrences
                </label>
              </div>
            </div>
          )}
          
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