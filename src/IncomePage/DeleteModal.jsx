import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./DeleteModal.module.css";

export const DeleteModal = ({ onCancel, onConfirm }) => {
  // Handle confirm deletion and show toast
  const handleConfirmClick = () => {
    onConfirm();

    // Show toast notification using react-toastify
    toast.success("Income has been successfully deleted!", {
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