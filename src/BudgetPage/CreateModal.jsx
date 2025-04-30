import { useState } from "react";
import styles from "./CreateModal.module.css";

export const CreateBudgetModal = ({ onClose, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");

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

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    const category = categories.find(cat => cat.name === categoryName);
    setSelectedCategory(category || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    if (selectedCategory.name === "Others" && !customCategoryName.trim()) {
      setError("Please enter a custom category name.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const budgetName =
        selectedCategory.name === "Others"
          ? customCategoryName.trim()
          : selectedCategory.name;

      const response = await fetch("http://localhost:8080/budget/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          budgetName,
          icon: selectedCategory.icon,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onAdd(result.data); // send new budget to parent
        onClose();
      } else {
        setError(result.message || "Error creating budget.");
      }
    } catch (err) {
      console.error("Error creating budget:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Create New Budget</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category:
            </label>
            <select
              id="category"
              className={styles.select}
              value={selectedCategory?.name || ""}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory?.name === "Others" && (
            <div className={styles.formGroup}>
              <label htmlFor="customCategory" className={styles.label}>
                Budget Title:
              </label>
              <input
                id="customCategory"
                type="text"
                className={styles.input}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="Enter custom budget name"
                required
              />
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
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};