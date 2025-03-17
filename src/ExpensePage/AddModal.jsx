import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

// Predefined category options with icons
const categories = [
  { name: "Food & Groceries", icon: "/food-icon.svg" },
  { name: "Transportation", icon: "/transport-icon.svg" },
  { name: "Shopping", icon: "/shopping-icon.svg" },
  { name: "Entertainment", icon: "/entertainment-icon.svg" },
  { name: "Housing", icon: "/housing-icon.svg" },
  { name: "Subscriptions", icon: "/subscription-icon.svg" },
  { name: "Savings", icon: "/saving-icon.svg" },
  { name: "Others", icon: "/otherExpense-icon.svg" },
];

export const AddExpenseModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  });

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Please select a category!");
      return;
    }

    // Close modal first
    onClose();

    // Pass data back to parent
    onAdd(formData);

    // Display success toast notification
    setTimeout(() => {
      toast.success("Category added successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }, 200); // Slight delay for a smoother experience
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalHeader}>Add Category</h2>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>Category:</label>
            <select
              id="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
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
