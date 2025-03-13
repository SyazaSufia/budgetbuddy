import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

export const AddIncomeModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: "", amount: "" });

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh

    // Close modal first
    onClose();

    // Delay toast appearance slightly after modal closes
    setTimeout(() => {
      toast.success("Income added successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }, 200); // Delay toast by 200ms
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Income</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Title:</label>
            <input
              id="title"
              type="text"
              className={styles.input}
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>Amount:</label>
            <input
              id="amount"
              type="number"
              className={styles.input}
              placeholder="RM 0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};
