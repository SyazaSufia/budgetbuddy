import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./CreateModal.module.css";

export const CreateBudgetModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: "", description: "" });

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
      toast.success("Budget Created successfully!", {
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
        <h2 className={styles.modalTitle}>Create New Budget</h2>
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
            <label htmlFor="description" className={styles.label}>Description:</label>
            <input
              id="description"
              type="text"
              className={styles.input}
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton}>Get Started</button>
          </div>
        </form>
      </div>
    </div>
  );
};
