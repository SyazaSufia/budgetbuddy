import React from "react";
import styles from "./DeleteModal.module.css";

export const DeleteModal = ({ onCancel, onConfirm, categoryName, hasExpenses }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Confirm Deletion</h2>
        
        <p className={styles.modalText}>
          {hasExpenses ? (
            <>
              Are you sure you want to delete the category{" "}
              <strong>{categoryName || "this category"}</strong>?{" "}
              <span className={styles.warningText}>
                This will also delete all expenses associated with this category.
              </span>
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <strong>{categoryName || "this category"}</strong>?
            </>
          )}
        </p>
        
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};