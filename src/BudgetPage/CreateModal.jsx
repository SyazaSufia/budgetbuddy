import { useState } from "react";
import styles from "./CreateModal.module.css";
import { toast } from "react-toastify";

export const CreateBudgetModal = ({ onClose, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [targetAmount, setTargetAmount] = useState(2000);

  // These are our predefined budget types (matching the category options in AddCategoryModal)
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

    if (!targetAmount || targetAmount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const budgetName =
        selectedCategory.name === "Others"
          ? customCategoryName.trim()
          : selectedCategory.name;

      // First create budget - keeping the budget type aligned with the selected category
      const budgetResponse = await fetch("http://localhost:8080/budget/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          budgetName,
          icon: selectedCategory.icon,
          targetAmount: parseFloat(targetAmount)
        }),
      });

      const budgetResult = await budgetResponse.json();

      if (budgetResponse.ok && budgetResult.success) {
        // Create the initial category that matches the budget
        const categoryResponse = await fetch("http://localhost:8080/budget/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            categoryName: budgetName,
            icon: selectedCategory.icon,
            budgetID: budgetResult.data.budgetID
          }),
        });

        const categoryResult = await categoryResponse.json();

        if (categoryResponse.ok && categoryResult.success) {
          // Successfully created both budget and initial category
          const updatedBudgetData = {
            ...budgetResult.data,
            categories: [categoryResult.data]
          };
          
          onAdd(updatedBudgetData);
          toast.success("Budget created successfully!");
          onClose();
        } else {
          setError("Budget created but failed to create category.");
        }
      } else {
        setError(budgetResult.message || "Error creating budget.");
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
              Type:
            </label>
            <select
              id="category"
              className={styles.select}
              value={selectedCategory?.name || ""}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a budget type</option>
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
                Title:
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

          <div className={styles.formGroup}>
            <label htmlFor="targetAmount" className={styles.label}>
              Amount:
            </label>
            <input
              id="targetAmount"
              type="number"
              className={styles.input}
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Enter budget amount"
              min="1"
              required
            />
          </div>

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