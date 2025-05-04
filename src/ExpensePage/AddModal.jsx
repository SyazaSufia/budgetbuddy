import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

export const AddCategoryModal = ({ onClose, onAdd, budgetId }) => {
  const [budgetDetails, setBudgetDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

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

  // Fetch the budget details to display the budget name and existing categories
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
        if (result.success && result.data) {
          setBudgetDetails(result.data.budget);
          
          // Store existing categories for this budget
          const budgetCategories = result.data.categories || [];
          setExistingCategories(budgetCategories);
          
          const budgetName = result.data.budget.budgetName;
          
          // Try to find if budget name matches one of our predefined categories
          const matchingCategory = categoryOptions.find(
            cat => cat.name.toLowerCase() === budgetName.toLowerCase()
          );
          
          let filteredCategories;
          
          if (matchingCategory) {

            const relevantCategories = findRelevantCategories(budgetName);
            
            // Filter out categories that already exist in this budget
            const existingCategoryNames = budgetCategories.map(cat => cat.categoryName);
            filteredCategories = relevantCategories.filter(
              cat => !existingCategoryNames.includes(cat.name)
            );
          } else {
            // For custom budget names, just filter out existing categories
            const existingCategoryNames = budgetCategories.map(cat => cat.categoryName);
            filteredCategories = categoryOptions.filter(
              cat => !existingCategoryNames.includes(cat.name)
            );
          }
          
          setAvailableCategories(filteredCategories);
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

  // Find relevant categories based on budget type
  const findRelevantCategories = (budgetName) => {

    const lowerBudgetName = budgetName.toLowerCase();
    
    // Always include "Others" category
    const othersCategory = categoryOptions.find(cat => cat.name === "Others");
    
    if (lowerBudgetName.includes("food") || lowerBudgetName.includes("groceries")) {
      // For Food budget, relevant categories might be Food, Entertainment
      return categoryOptions.filter(cat => 
        cat.name === "Food & Groceries" || 
        cat.name === "Entertainment" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("transport")) {
      // For Transportation budget, relevant categories might be Transportation, Shopping
      return categoryOptions.filter(cat => 
        cat.name === "Transportation" || 
        cat.name === "Shopping" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("shop")) {
      // For Shopping budget, relevant categories might be Shopping, Entertainment
      return categoryOptions.filter(cat => 
        cat.name === "Shopping" || 
        cat.name === "Entertainment" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("entertain")) {
      // For Entertainment budget
      return categoryOptions.filter(cat => 
        cat.name === "Entertainment" || 
        cat.name === "Shopping" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("hous") || lowerBudgetName.includes("home")) {
      // For Housing budget
      return categoryOptions.filter(cat => 
        cat.name === "Housing" || 
        cat.name === "Subscriptions" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("subscription") || lowerBudgetName.includes("subs")) {
      // For Subscriptions budget
      return categoryOptions.filter(cat => 
        cat.name === "Subscriptions" || 
        cat.name === "Entertainment" || 
        cat.name === "Others"
      );
    }
    
    if (lowerBudgetName.includes("save") || lowerBudgetName.includes("saving")) {
      // For Savings budget
      return categoryOptions.filter(cat => 
        cat.name === "Savings" || 
        cat.name === "Others"
      );
    }
    
    return [othersCategory];
  };

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

      // Add the category through the API
      const response = await fetch("http://localhost:8080/budget/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Pass the new category to the parent component
        await onAdd(result.data);
        toast.success("Category added successfully!");
        onClose();
      } else {
        toast.error(result.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display message if all categories are already added
  if (!isLoading && availableCategories.length === 0 && selectedCategory !== "Others") {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles.modalHeader}>Add Category</h2>
          <div className={styles.noCategories}>
            <p>All relevant categories are already added to this budget.</p>
            <p>You can still add a custom category using the "Others" option.</p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>Category:</label>
            <select
              id="category"
              value="Others"
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.select}
              required
            >
              <option value="Others">Others</option>
            </select>
          </div>
          
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
          
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className={styles.confirmButton}
              onClick={handleSubmit}
              disabled={!customCategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalHeader}>
          Add Category to {budgetDetails ? budgetDetails.budgetName : "Budget"}
        </h2>
        
        {isLoading ? (
          <div className={styles.loadingIndicator}>Loading budget details...</div>
        ) : (
          <>
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
                  {availableCategories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {!availableCategories.some(cat => cat.name === "Others") && (
                    <option value="Others">Others</option>
                  )}
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