import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./DeleteModal.module.css";

export const DeleteModal = ({ onCancel, onConfirm, isRecurring }) => {
  // State for tracking if all recurring instances should be deleted
  const [deleteAllRecurrences, setDeleteAllRecurrences] = useState(false);

  // Handle confirm deletion and show toast
  const handleConfirmClick = () => {
    // Call onConfirm with the deleteAllRecurrences parameter
    onConfirm(deleteAllRecurrences);

    // Show different toast message based on what's being deleted
    const message = isRecurring && deleteAllRecurrences
      ? "All recurring income entries have been deleted!"
      : "Income has been successfully deleted!";

    // Show toast notification using react-toastify
    toast.success(message, {
      position: "top-right", // Toast position
      autoClose: 3000, // Auto-close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Delete Income?</h2>
          <p className={styles.modalText}>
            Are you sure you want to delete this income? This action cannot be undone.
          </p>
          
          {/* Show recurring checkbox option only for recurring incomes */}
          {isRecurring && (
            <div className={styles.recurringOption}>
              <input
                type="checkbox"
                id="deleteAllRecurrences"
                checked={deleteAllRecurrences}
                onChange={(e) => setDeleteAllRecurrences(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="deleteAllRecurrences" className={styles.checkboxLabel}>
                Delete all recurring instances of this income
              </label>
            </div>
          )}
          
          <div className={styles.modalActions}>
            <button onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleConfirmClick} className={styles.confirmButton}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};