import React from 'react';
import styles from './DeleteModal.module.css';

export const DeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Delete Budget?</h2>
        <p className={styles.modalText}>
          Are you sure you want to delete this budget? This will also delete all categories and expenses associated with this budget. This action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button 
            onClick={onCancel}
            className={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={styles.confirmButton}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};