import React, { useState, useEffect } from "react";
import styles from "./Expense.module.css";
import SidebarNav from "./SideBar";
import { AddModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { toast } from "react-toastify";

export default function Expense({ user }) {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] =
    useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      // Try the /categories endpoint first, which is what the fixed route structure uses
      const response = await fetch("http://localhost:8080/expense/categories", {
        credentials: "include", // Send session cookies
      });

      // If that fails, try the original endpoint that might be in your current backend
      if (!response.ok) {
        const fallbackResponse = await fetch("http://localhost:8080/expense", {
          credentials: "include",
        });

        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        return handleApiResponse(fallbackResponse);
      }

      return handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Helper function to process API response
  const handleApiResponse = async (response) => {
    const result = await response.json();

    if (!Array.isArray(result.data)) {
      console.error("Expected an array but got:", result.data);
      throw new Error("Unexpected response format: 'data' should be an array.");
    }

    // Check if data is empty
    if (result.data.length === 0) {
      console.warn("No categories found.");
      setCategories([]); // Initialize with an empty array
      return;
    }

    setCategories(result.data); // Store the categories

    // Fetch expenses for each category
    result.data.forEach((category) => {
      fetchCategoryExpenses(category.categoryID || category.id);
    });
  };

  // Fetch expenses for a specific category
  const fetchCategoryExpenses = async (categoryId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/expense/category/${categoryId}/expenses`,
        {
          credentials: "include", // Send session cookies
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses for category ${categoryId}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // Format dates and store expenses by category ID
        const formattedExpenses = result.data.map((expense) => ({
          ...expense,
          date: expense.date ? expense.date.split("T")[0] : "N/A", // Format date or use N/A
        }));

        setExpenses((prev) => ({
          ...prev,
          [categoryId]: formattedExpenses,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching expenses for category ${categoryId}:`,
        error
      );
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on component mount
  }, []);

  // Calculate total expense across all categories
  const totalExpense = Object.values(expenses)
    .flat()
    .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  // Calculate total for each category
  const getCategoryTotal = (categoryId) => {
    return (expenses[categoryId] || []).reduce(
      (sum, expense) => sum + parseFloat(expense.amount || 0),
      0
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDeleteCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/expense/category/${selectedCategoryId}`,
        {
          method: "DELETE",
          credentials: "include", // Send session cookies
        }
      );
      if (response.ok) {
        // Remove the category and its expenses
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat.categoryID !== selectedCategoryId)
        );

        setExpenses((prevExpenses) => {
          const updatedExpenses = { ...prevExpenses };
          delete updatedExpenses[selectedCategoryId];
          return updatedExpenses;
        });

        setIsDeleteCategoryModalOpen(false);
        setSelectedCategoryId(null);
      } else {
        const error = await response.json();
        console.error("Failed to delete category:", error.message);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Add expense
  const handleAddExpenseSuccess = (newExpense) => {
    // Update the state with the new expense
    setExpenses((prev) => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), newExpense],
    }));

    // Show success toast
    toast.success("Expense added successfully!");

    // Reset form state
    setIsAddExpenseModalOpen(false);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate("");
  };

  // Delete expense
  const handleDeleteExpenseClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteExpenseModalOpen(true);
  };

  const handleDeleteExpenseConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/expense/expense/${selectedExpenseId}`,
        {
          method: "DELETE",
          credentials: "include", // Send session cookies
        }
      );
      if (response.ok) {
        setExpenses((prevExpenses) => {
          const updated = {};
          Object.keys(prevExpenses).forEach((categoryId) => {
            updated[categoryId] = prevExpenses[categoryId].filter(
              (expense) => expense.expenseID !== selectedExpenseId
            );
          });
          return updated;
        });
        setIsDeleteExpenseModalOpen(false);
        setSelectedExpenseId(null);
      } else {
        const error = await response.json();
        console.error("Failed to delete expense:", error.message);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleAddCategory = () => {
    fetchCategories(); // Re-fetch everything properly from backend
  };

  const handleAddExpenseClick = (categoryId) => {
    console.log("Category selected:", categoryId); // Debugging
    setSelectedCategoryId(categoryId); // Set category to add expense for
    setIsAddModalOpen(true);
  };

  return (
    <>
      <main className={styles.expenseLayout}>
        <div className={styles.content}>
          <SidebarNav />
          <section className={styles.main}>
            <header className={styles.headerSection}>
              <h1 className={styles.pageHeader}>
                Hello, {user ? user.name : "Guest"}!
              </h1>
            </header>

            {/* Total Expense Section */}
            <section className={styles.content3}>
              <form className={styles.totalExpense}>
                <label htmlFor="totalExpense" className={styles.labelM}>
                  Total Expenses
                </label>
                <div className={styles.inputC}>
                  <div className={styles.inputM}>
                    <input
                      id="totalExpense"
                      type="text"
                      className={styles.placeholder}
                      value={`RM ${totalExpense.toFixed(2)}`}
                      readOnly
                      aria-label="Total Expense Amount"
                    />
                  </div>
                </div>
              </form>
            </section>

            {/* Expense Categories */}
            <section className={styles.expenseListContainer}>
              {categories.map((category) => (
                <div
                  key={category.categoryID}
                  className={styles.categoryContainer}
                >
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryInfo}>
                      <div className={styles.categoryTitleWithIcon}>
                        <img
                          src={category.icon}
                          alt={`${category.categoryName} icon`}
                          className={styles.categoryIcon}
                        />
                        <h3 className={styles.categoryTitle}>
                          {category.categoryName}
                        </h3>
                      </div>
                      <span className={styles.categoryTotal}>
                        RM {getCategoryTotal(category.categoryID).toFixed(2)}
                      </span>
                      <button
                        className={styles.expandButton}
                        onClick={() => toggleCategory(category.categoryID)}
                      >
                        <img
                          src="/chevron-right.svg"
                          alt="Expand"
                          className={`${styles.chevronIcon} ${expandedCategories[category.categoryID] ? styles.expanded : ""}`}
                        />
                      </button>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setSelectedCategoryId(category.categoryID);
                          setIsAddExpenseModalOpen(true);
                        }}
                      >
                        <img src="/add-icon.svg" alt="Add" />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() =>
                          handleDeleteCategoryClick(category.categoryID)
                        }
                      >
                        <img src="/delete-icon.svg" alt="Delete" />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category.categoryID] && (
                    <div className={styles.expenseList}>
                      {(expenses[category.categoryID] || []).map((expense) => (
                        <article
                          key={expense.expenseID}
                          className={styles.expenseItem}
                        >
                          <div className={styles.expenseDetails}>
                            {/* Title on the left */}
                            <div className={styles.titleSection}>
                              <span className={styles.expenseTitle}>
                                {expense.title}
                              </span>
                            </div>
                            {/* Amount, Date, and Action Buttons on the right */}
                            <div className={styles.rightSection}>
                              <span className={styles.expenseAmount}>
                                RM {expense.amount}
                              </span>
                              <span className={styles.expenseDate}>
                                {expense.date}
                              </span>
                              <div className={styles.actionButtons}>
                                <button className={styles.iconButton}>
                                  <img src="/edit-icon.svg" alt="Edit" />
                                </button>
                                <button
                                  className={styles.iconButton}
                                  onClick={() =>
                                    handleDeleteExpenseClick(expense.expenseID)
                                  }
                                >
                                  <img src="/delete-icon.svg" alt="Delete" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                      {(expenses[category.categoryID] || []).length === 0 && (
                        <p className={styles.noExpenses}>No expenses yet</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Category Button */}
              <div className={styles.addCategoryContainer}>
                <button
                  className={styles.addExpenseButton}
                  onClick={() => setIsAddCategoryModalOpen(true)}
                >
                  <img src="/add-icon.svg" alt="Add" />
                  <span>Add Category</span>
                </button>
              </div>
            </section>

            {isDeleteCategoryModalOpen && (
              <DeleteModal
                onCancel={() => setIsDeleteCategoryModalOpen(false)}
                onConfirm={handleDeleteCategoryConfirm}
              />
            )}
            {isDeleteExpenseModalOpen && (
              <DeleteExpenseModal
                onCancel={() => setIsDeleteExpenseModalOpen(false)}
                onConfirm={handleDeleteExpenseConfirm}
              />
            )}
          </section>
        </div>

        {/* Add Category Modal */}
        {isAddCategoryModalOpen && (
          <AddModal
            onClose={() => setIsAddCategoryModalOpen(false)}
            onAdd={handleAddCategory}
          />
        )}

        {isAddExpenseModalOpen && (
          <AddExpenseModal
            categoryId={selectedCategoryId}
            onClose={() => setIsAddExpenseModalOpen(false)}
            onAdd={handleAddExpenseSuccess}
          />
        )}
      </main>
    </>
  );
}
