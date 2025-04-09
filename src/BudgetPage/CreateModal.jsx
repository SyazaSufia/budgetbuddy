import { useEffect, useState } from "react";
import styles from "./CreateModal.module.css";

export const CreateBudgetModal = ({ onClose, onAdd }) => {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedCategoryID, setSelectedCategoryID] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, budgetRes] = await Promise.all([
          fetch("http://localhost:8080/expense/categories", {
            credentials: "include",
          }),
          fetch("http://localhost:8080/budget/budgets", {
            credentials: "include",
          }),
        ]);

        const catData = await catRes.json();
        const budgetData = await budgetRes.json();

        if (catData.success && budgetData.success) {
          setCategories(catData.data);
          setBudgets(budgetData.data);
        } else {
          alert("Failed to load categories or budgets.");
        }
      } catch (err) {
        console.error("Error loading modal data:", err);
        alert("Error loading data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const usedCategoryIDs = budgets.map((b) => b.categoryID);
  const availableCategories = categories.filter(
    (cat) => !usedCategoryIDs.includes(cat.categoryID)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryID) {
      alert("Please select a category.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Fixed the endpoint URL to match the backend route
      const response = await fetch("http://localhost:8080/budget/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryID: selectedCategoryID }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const selected = categories.find(
          (c) => c.categoryID === parseInt(selectedCategoryID)
        );

        onAdd({
          budgetID: result.insertId,
          categoryID: selectedCategoryID,
          categoryName: selected.categoryName,
          icon: selected.icon,
          categoryAmount: 0,
          targetAmount: 2000,
        });

        onClose();
      } else {
        alert(result.message || "Error creating budget.");
      }
    } catch (err) {
      console.error("Error submitting budget:", err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Create New Budget</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="categoryID" className={styles.label}>
              Select Category:
            </label>
            <select
              id="categoryID"
              className={styles.input}
              value={selectedCategoryID}
              onChange={(e) => setSelectedCategoryID(e.target.value)}
              required
              disabled={availableCategories.length === 0}
            >
              <option value="">
                {availableCategories.length === 0
                  ? "-- No Available Categories --"
                  : "-- Select --"}
              </option>
              {availableCategories.map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            {availableCategories.length > 0 && (
              <button
                type="submit"
                className={styles.confirmButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Budget"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
