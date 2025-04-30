import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

export const AddCategoryModal = ({ onClose, onAdd, budgetId }) => {
  const [budgetName, setBudgetName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined category options with icons
  const categoryOptions = [
    { name: "Food & Groceries", icon: "/food-icon.svg" },
    { name: "Transportation", icon: "/transport-icon.svg" },
    { name: "Shopping", icon: "/shopping-icon.svg" },
    { name: "Entertainment", icon: "/entertainment-icon.svg" },
    { name: "Housing", icon: "/housing-icon.svg" },
    { name: "Subscriptions", icon: "/subscription-icon.svg" },
    { name: "Savings", icon: "/saving-icon.svg" },
    { name: "Others", icon: "/otherExpense-icon.svg" },
  ];

  // Fetch the budget details to display the budget name
  useEffect(() => {
    const fetchBudgetDetails = async () => {
      if (!budgetId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/budget/budgets/${budgetId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch budget details");
        }

        const result = await response.json();
        if (result.success && result.data && result.data.budget) {
          setBudgetName(result.data.budget.budgetName);
        }
      } catch (error) {
        console.error("Error fetching budget details:", error);
        toast.error("Could not load budget details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetDetails();
  }, [budgetId]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Reset custom category name if not "Others"
    if (e.target.value !== "Others") {
      setCustomCategoryName("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error("Please select a category!");
      return;
    }

    if (selectedCategory === "Others" && !customCategoryName.trim()) {
      toast.error("Please enter a custom category name!");
      return;
    }

    if (!budgetId) {
      toast.error("No active budget found!");
      return;
    }

    setIsSubmitting(true);

    const selectedCategoryOption = categoryOptions.find(cat => cat.name === selectedCategory);
    const icon = selectedCategoryOption ? selectedCategoryOption.icon : "/otherExpense-icon.svg";

    try {
      // Prepare category data
      const categoryData = {
        categoryName: selectedCategory === "Others" ? customCategoryName.trim() : selectedCategory,
        icon: icon,
        budgetID: budgetId
      };

      // Call the onAdd function passed from the parent component
      await onAdd(categoryData);
      
      // Parent handles success message and modal closing
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalHeader}>Add Category</h2>
        
        {isLoading ? (
          <div className={styles.loadingIndicator}>Loading budget details...</div>
        ) : (
          <>
            {budgetName && (
              <div className={styles.budgetInfo}>
                <span className={styles.budgetLabel}>Adding to budget:</span>
                <span className={styles.budgetName}>{budgetName}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Category Selection */}
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>Category:</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className={styles.select}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Custom Category Name (if "Others" is selected) */}
              {selectedCategory === "Others" && (
                <div className={styles.formGroup}>
                  <label htmlFor="customCategory" className={styles.label}>
                    Custom Category Name:
                  </label>
                  <input
                    id="customCategory"
                    type="text"
                    className={styles.input}
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
              )}
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.confirmButton}
                  disabled={!selectedCategory || (selectedCategory === "Others" && !customCategoryName.trim()) || isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </>
        )}
        
      </div>
    </div>
  );
};