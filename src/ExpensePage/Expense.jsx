import React, { useState, useEffect } from "react";
import styles from "./Expense.module.css";
import SidebarNav from "./SideBar";
import { AddCategoryModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { EditExpenseModal } from "./EditExpenseModal";
import TimeFilter from "./TimeFilter";
import { toast } from "react-toastify";

// Component to display a single expense item
const ExpenseItem = ({ expense, onEdit, onDelete }) => (
  <article className={styles.expenseItem}>
    <div className={styles.expenseDetails}>
      <div className={styles.titleSection}>
        <span className={styles.expenseTitle}>{expense.title}</span>
      </div>
      <div className={styles.rightSection}>
        <span className={styles.expenseAmount}>
          RM {parseFloat(expense.amount).toFixed(2)}
        </span>
        <span className={styles.expenseDate}>{expense.date}</span>
        <div className={styles.actionButtons}>
          <button className={styles.iconButton} onClick={() => onEdit(expense)}>
            <img src="/edit-icon.svg" alt="Edit" />
          </button>
          <button className={styles.iconButton} onClick={() => onDelete(expense.expenseID)}>
            <img src="/delete-icon.svg" alt="Delete" />
          </button>
        </div>
      </div>
    </div>
  </article>
);

// Component to display a category with its expenses
const CategoryItem = ({ 
  category, 
  isExpanded, 
  onToggle, 
  onDelete, 
  onAddExpense, 
  expenses,
  categoryTotal,
  activeFilter,
  onEditExpense,
  onDeleteExpense 
}) => (
  <div className={styles.categoryContainer}>
    <div className={styles.categoryHeader}>
      <div className={styles.categoryInfo}>
        <div className={styles.categoryTitleWithIcon}>
          <img
            src={category.icon}
            alt={`${category.categoryName} icon`}
            className={styles.categoryIcon}
          />
          <h3 className={styles.categoryTitle}>{category.categoryName}</h3>
        </div>
        <span className={styles.categoryTotal}>
          RM {categoryTotal.toFixed(2)}
        </span>
        <button className={styles.expandButton} onClick={onToggle}>
          <img
            src="/chevron-right.svg"
            alt="Expand"
            className={`${styles.chevronIcon} ${isExpanded ? styles.expanded : ""}`}
          />
        </button>
      </div>
      <div className={styles.actionButtons}>
        <button className={styles.iconButton} onClick={onAddExpense}>
          <img src="/add-icon.svg" alt="Add" />
        </button>
        <button className={styles.iconButton} onClick={onDelete}>
          <img src="/delete-icon.svg" alt="Delete" />
        </button>
      </div>
    </div>

    {isExpanded && (
      <div className={styles.expenseList}>
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense.expenseID}
              expense={expense}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <img
              src="/empty-illustration.svg"
              alt="No expenses"
              className={styles.emptyIllustration}
            />
            <p className={styles.noExpenses}>
              No expenses for this{" "}
              {activeFilter === "thisMonth"
                ? "month"
                : activeFilter === "lastMonth"
                  ? "last month"
                  : activeFilter === "thisYear"
                    ? "year"
                    : "period"}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
);

// Empty state component
const EmptyState = ({ message }) => (
  <div className={styles.emptyState}>
    <img
      src="/empty-illustration.svg"
      alt="No data"
      className={styles.emptyIllustration}
    />
    <p className={styles.noCategories}>{message}</p>
  </div>
);

export default function Expense({ user }) {
  // State variables
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [filteredExpenses, setFilteredExpenses] = useState({});
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("thisMonth");
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetId, setBudgetId] = useState(null); // Store the active budget ID

  // API URLs - CORRECTED to match server.js route prefixes
  const API_BASE_URL = "http://localhost:8080";
  
  // Budget routes with "/budget" prefix
  const BUDGETS_URL = `${API_BASE_URL}/budget/budgets`;
  const CATEGORIES_URL = (budgetId) => `${API_BASE_URL}/budget/budgets/${budgetId}/categories`;
  const CATEGORY_URL = (id) => `${API_BASE_URL}/budget/categories/${id}`;
  const ADD_CATEGORY_URL = `${API_BASE_URL}/budget/categories`;
  
  // Expense routes with "/expense" prefix
  const CATEGORY_EXPENSES_URL = (id) => `${API_BASE_URL}/expense/categories/${id}/expenses`;
  const EXPENSE_URL = (id) => `${API_BASE_URL}/expense/expenses/${id}`;
  const ADD_EXPENSE_URL = `${API_BASE_URL}/expense/expenses`;

  // Fetch user's budgets first
  const fetchBudgets = async () => {
    try {
      const response = await fetch(BUDGETS_URL, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch budgets");

      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Set the first budget as active
        setBudgetId(result.data[0].budgetID);
        return result.data[0].budgetID;
      } else {
        // No budgets found
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setIsLoading(false);
      return null;
    }
  };

  // Fetch categories for the active budget
  const fetchCategories = async (activeBudgetId) => {
    if (!activeBudgetId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(CATEGORIES_URL(activeBudgetId), {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      const result = await response.json();
      if (!Array.isArray(result.data)) {
        throw new Error("Unexpected response format: 'data' should be an array.");
      }

      setCategories(result.data);

      // Fetch expenses for each category
      for (const category of result.data) {
        await fetchCategoryExpenses(category.categoryID || category.id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch expenses for a specific category
  const fetchCategoryExpenses = async (categoryId) => {
    try {
      const response = await fetch(CATEGORY_EXPENSES_URL(categoryId), {
        credentials: "include",
      });

      if (!response.ok) {
        // Initialize with empty array if fetch fails
        setExpenses((prev) => ({ ...prev, [categoryId]: [] }));
        return;
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Format dates and store expenses by category ID
        const formattedExpenses = result.data.map((expense) => ({
          ...expense,
          date: expense.date ? expense.date.split("T")[0] : "N/A",
        }));

        setExpenses((prev) => ({ ...prev, [categoryId]: formattedExpenses }));
      }
    } catch (error) {
      console.error(`Error fetching expenses for category ${categoryId}:`, error);
      setExpenses((prev) => ({ ...prev, [categoryId]: [] }));
    }
  };

  // Apply time filter to expenses
  const applyTimeFilter = () => {
    const currentDate = new Date();
    const filtered = {};

    if (Object.keys(expenses).length > 0) {
      Object.keys(expenses).forEach((categoryId) => {
        filtered[categoryId] = expenses[categoryId].filter((expense) => {
          if (!expense.date || expense.date === "N/A") return false;
          const expenseDate = new Date(expense.date);

          switch (activeFilter) {
            case "thisMonth":
              return (
                expenseDate.getMonth() === currentDate.getMonth() &&
                expenseDate.getFullYear() === currentDate.getFullYear()
              );
            case "lastMonth": {
              const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
              const lastMonthYear = currentDate.getMonth() === 0
                ? currentDate.getFullYear() - 1
                : currentDate.getFullYear();
              return (
                expenseDate.getMonth() === lastMonth &&
                expenseDate.getFullYear() === lastMonthYear
              );
            }
            case "thisYear":
              return expenseDate.getFullYear() === currentDate.getFullYear();
            case "last12Months": {
              const twelveMonthsAgo = new Date();
              twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
              return expenseDate >= twelveMonthsAgo;
            }
            default:
              return true;
          }
        });
      });
    }

    setFilteredExpenses(filtered);

    // Determine which categories to display
    if (activeFilter === "thisMonth") {
      setVisibleCategories(categories);
    } else {
      const categoriesWithExpenses = categories.filter(
        (category) => filtered[category.categoryID] && filtered[category.categoryID].length > 0
      );
      setVisibleCategories(categoriesWithExpenses);
    }
  };

  // Event handlers
  const handleEditExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setIsEditExpenseModalOpen(true);
  };

  const handleEditExpenseSuccess = async (updatedExpense) => {
    setExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) =>
          expense.expenseID === updatedExpense.expenseID ? updatedExpense : expense
        );
      });
      return updated;
    });

    setFilteredExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) =>
          expense.expenseID === updatedExpense.expenseID ? updatedExpense : expense
        );
      });
      return updated;
    });

    if (budgetId) {
      await fetchCategories(budgetId);
    }
    setIsEditExpenseModalOpen(false);
    setSelectedExpense(null);
    toast.success("Expense updated successfully!");
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
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
      const response = await fetch(CATEGORY_URL(selectedCategoryId), {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        // Remove the category and its expenses from state
        setCategories((prev) => prev.filter((cat) => cat.categoryID !== selectedCategoryId));
        
        setExpenses((prev) => {
          const updated = { ...prev };
          delete updated[selectedCategoryId];
          return updated;
        });
        
        setFilteredExpenses((prev) => {
          const updated = { ...prev };
          delete updated[selectedCategoryId];
          return updated;
        });
        
        setVisibleCategories((prev) => 
          prev.filter((cat) => cat.categoryID !== selectedCategoryId)
        );
        
        setIsDeleteCategoryModalOpen(false);
        setSelectedCategoryId(null);
        toast.success("Category deleted successfully!");
      } else {
        const error = await response.json();
        console.error("Failed to delete category:", error.message);
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    }
  };

  const handleAddExpenseClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsAddExpenseModalOpen(true);
  };

  const handleAddExpenseSuccess = async (newExpense) => {
    setExpenses((prev) => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), newExpense],
    }));

    if (budgetId) {
      await fetchCategories(budgetId);
    }
    setIsAddExpenseModalOpen(false);
    toast.success("Expense added successfully!");
  };

  const handleDeleteExpenseClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteExpenseModalOpen(true);
  };

  const handleDeleteExpenseConfirm = async () => {
    try {
      const response = await fetch(EXPENSE_URL(selectedExpenseId), {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        // Remove expense from state
        const updateExpensesList = (prevExpenses) => {
          const updated = {};
          Object.keys(prevExpenses).forEach((categoryId) => {
            updated[categoryId] = prevExpenses[categoryId].filter(
              (expense) => expense.expenseID !== selectedExpenseId
            );
          });
          return updated;
        };
        
        setExpenses(updateExpensesList);
        setFilteredExpenses(updateExpensesList);
        
        if (budgetId) {
          await fetchCategories(budgetId);
        }
        setIsDeleteExpenseModalOpen(false);
        setSelectedExpenseId(null);
        toast.success("Expense deleted successfully!");
      } else {
        const error = await response.json();
        console.error("Failed to delete expense:", error.message);
        toast.error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Error deleting expense");
    }
  };

  // Handle adding a new category
  const handleAddCategory = async (categoryData) => {
    try {
      // Make sure budgetID is included in the data
      const dataToSend = {
        ...categoryData,
        budgetID: budgetId
      };
      
      const response = await fetch(ADD_CATEGORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });
      
      if (response.ok) {
        if (budgetId) {
          await fetchCategories(budgetId);
        }
        setIsAddCategoryModalOpen(false);
        toast.success("Category added successfully!");
        return true;
      } else {
        const error = await response.json();
        console.error("Failed to add category:", error.message);
        toast.error(error.message || "Failed to add category");
        return false;
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category");
      return false;
    }
  };

  // Calculate total expense across all filtered categories
  const calculateTotalExpense = () => {
    return Object.values(filteredExpenses)
      .flat()
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  };

  // Calculate total for each category based on filtered expenses
  const getCategoryTotal = (categoryId) => {
    return (filteredExpenses[categoryId] || []).reduce(
      (sum, expense) => sum + parseFloat(expense.amount || 0),
      0
    );
  };

  // Get message for empty states
  const getEmptyStateMessage = () => {
    if (!budgetId) {
      return "No budgets found. Create a budget first to get started.";
    }
    if (categories.length === 0) {
      return "No expense categories found. Create a category to get started.";
    }
    return `No expenses found for the selected ${
      activeFilter === "thisMonth"
        ? "month"
        : activeFilter === "lastMonth"
          ? "last month"
          : activeFilter === "thisYear"
            ? "year"
            : "period"
    }.`;
  };

  // Effect hooks
  useEffect(() => {
    const initializeData = async () => {
      const activeBudgetId = await fetchBudgets();
      if (activeBudgetId) {
        await fetchCategories(activeBudgetId);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    applyTimeFilter();
  }, [activeFilter, expenses, categories]);

  const totalExpense = calculateTotalExpense();

  return (
    <>
      <main className={styles.expenseLayout}>
        <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
          <SidebarNav onToggleCollapse={handleSidebarToggle} />
          <section className={styles.main}>
            <header className={styles.headerSection}>
              <h1 className={styles.pageHeader}>
                Hello, {user ? user.name : "Guest"}!
              </h1>
              <div className={styles.filterContainer}>
                <TimeFilter
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                />
              </div>
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
              {isLoading ? (
                <div className={styles.loadingState}>Loading categories...</div>
              ) : visibleCategories.length > 0 ? (
                visibleCategories.map((category) => (
                  <CategoryItem
                    key={category.categoryID}
                    category={category}
                    isExpanded={expandedCategories[category.categoryID]}
                    onToggle={() => toggleCategory(category.categoryID)}
                    onDelete={() => handleDeleteCategoryClick(category.categoryID)}
                    onAddExpense={() => handleAddExpenseClick(category.categoryID)}
                    expenses={filteredExpenses[category.categoryID] || []}
                    categoryTotal={getCategoryTotal(category.categoryID)}
                    activeFilter={activeFilter}
                    onEditExpense={handleEditExpenseClick}
                    onDeleteExpense={handleDeleteExpenseClick}
                  />
                ))
              ) : (
                <EmptyState message={getEmptyStateMessage()} />
              )}

              {/* Add Category Button - Always show if we have a budget */}
              {budgetId && (
                <div className={styles.addCategoryContainer}>
                  <button
                    className={styles.addExpenseButton}
                    onClick={() => setIsAddCategoryModalOpen(true)}
                  >
                    <img src="/add-icon.svg" alt="Add" />
                    <span>Add Category</span>
                  </button>
                </div>
              )}
            </section>

            {/* Modals */}
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
          <AddCategoryModal
            onClose={() => setIsAddCategoryModalOpen(false)}
            onAdd={handleAddCategory}
            budgetId={budgetId}
          />
        )}

        {/* Add Expense Modal */}
        {isAddExpenseModalOpen && (
          <AddExpenseModal
            categoryId={selectedCategoryId}
            onClose={() => setIsAddExpenseModalOpen(false)}
            onAdd={handleAddExpenseSuccess}
          />
        )}

        {/* Edit Expense Modal */}
        {isEditExpenseModalOpen && (
          <EditExpenseModal
            expense={selectedExpense}
            onClose={() => setIsEditExpenseModalOpen(false)}
            onEdit={handleEditExpenseSuccess}
          />
        )}
      </main>
    </>
  );
}