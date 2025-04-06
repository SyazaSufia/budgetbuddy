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

export const AddModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    category: "",
  });

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select a category!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    const selectedCategory = categories.find(cat => cat.name === formData.category);
    const icon = selectedCategory ? selectedCategory.icon : "";

    try {
      // API call to add category
      const response = await fetch("http://localhost:8080/expense/category", {
        method: "POST",
        credentials: "include", // Send session cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          category: formData.category, 
          icon: icon 
        }),
      });

      if (response.ok) {
        // Display success toast notification
        toast.success("Category added successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });

        // Trigger the parent component to refresh categories
        onAdd();
        
        // Close the modal
        onClose();
      } else {
        const error = await response.json();
        console.error("Failed to add category:", error.message);
        toast.error("Failed to add category. Please try again.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
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