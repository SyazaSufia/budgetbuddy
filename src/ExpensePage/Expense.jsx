import React, { useState, useEffect } from "react";
import styles from "./Expense.module.css";
import SideBar from "./SideBar";
import { DeleteExpenseModal } from "./DeleteExpenseModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { EditExpenseModal } from "./EditExpenseModal";
import TimeFilter from "./TimeFilter";
import { toast } from "react-toastify";
import { expenseAPI, budgetAPI, categoryAPI, incomeAPI } from "../services/UserApi";

// Component to display a single expense item
const ExpenseItem = ({ expense, onEdit, onDelete, isViewOnly }) => (
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
        {/* Only show action buttons when not in view-only mode */}
        {!isViewOnly && (
          <div className={styles.actionButtons}>
            <button className={styles.iconButton} onClick={() => onEdit(expense)}>
              <img src="/edit-icon.svg" alt="Edit" />
            </button>
            <button
              className={styles.iconButton}
              onClick={() => onDelete(expense.expenseID)}
            >
              <img src="/delete-icon.svg" alt="Delete" />
            </button>
          </div>
        )}
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
  onDeleteExpense,
  budgetName,
  isViewOnly, // New prop to control view-only mode
  hasIncomeForMonth, // New prop to check income
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
          <h3 className={styles.categoryTitle}>
            {category.categoryName}
            {budgetName && budgetName !== category.categoryName && (
              <span className={styles.budgetTag}> ({budgetName})</span>
            )}
          </h3>
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
        {/* Only show add button when not in view-only mode and user has income */}
        {!isViewOnly && (
          <button 
            className={`${styles.iconButton} ${!hasIncomeForMonth ? styles.disabledButton : ''}`}
            onClick={hasIncomeForMonth ? onAddExpense : undefined}
            disabled={!hasIncomeForMonth}
            title={!hasIncomeForMonth ? "Add income first to add expenses" : "Add expense"}
          >
            <img src="/add-icon.svg" alt="Add" />
          </button>
        )}
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
              isViewOnly={isViewOnly}
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
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] =
    useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("thisMonth");
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState([]); // Store all user budgets
  const [categoryBudgetMap, setCategoryBudgetMap] = useState({}); // Map categories to their budget names
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [categoryHasExpenses, setCategoryHasExpenses] = useState(false);
  const [incomeInfo, setIncomeInfo] = useState(null); // Track income status

  // Check if current filter is view-only (everything except "thisMonth")
  const isViewOnlyMode = activeFilter !== "thisMonth";

  // Check if user has income for current month (only when not in view-only mode)
  const checkCurrentMonthIncome = async () => {
    if (isViewOnlyMode) return; // Skip income check for historical data
    
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const incomeCheck = await incomeAPI.checkMonthlyIncomeExists(currentMonth, currentYear);
      
      if (incomeCheck.success) {
        setIncomeInfo({
          hasIncome: incomeCheck.data.hasIncome,
          totalIncome: incomeCheck.data.totalIncome,
          month: currentMonth,
          year: currentYear
        });
      } else {
        setIncomeInfo({ hasIncome: false, totalIncome: 0 });
      }
    } catch (err) {
      console.error("Error checking income:", err);
      setIncomeInfo({ hasIncome: false, totalIncome: 0 });
    }
  };

  //Fetch categories based on time filter
  const fetchCategoriesForTimeFilter = async (timeFilter) => {
    try {
      setIsLoading(true);

      // Use the proper API method from categoryAPI
      const result = await categoryAPI.getCategoriesForTimeFilter(timeFilter);

      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);

        // Create budget mapping from the categories data
        // Since we now get budget info directly from the query, we can map it easily
        const budgetMapping = {};

        result.data.forEach((category) => {
          budgetMapping[category.categoryID] = category.budgetName;
        });

        setCategoryBudgetMap(budgetMapping);

        // Fetch expenses for each category
        for (const category of result.data) {
          await fetchCategoryExpenses(category.categoryID);
        }
      } else {
        setCategories([]);
        setCategoryBudgetMap({});
      }
    } catch (error) {
      console.error("Error fetching categories for time filter:", error);
      setCategories([]);
      setCategoryBudgetMap({});

      // Show user-friendly error message
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all user's budgets (kept for compatibility)
  const fetchBudgets = async () => {
    try {
      const result = await budgetAPI.getBudgets();

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        setBudgets(result.data);
        return result.data; // Return all budgets
      } else {
        // No budgets found
        return [];
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      return [];
    }
  };

  // Fetch expenses for a specific category
  const fetchCategoryExpenses = async (categoryId) => {
    try {
      const result = await expenseAPI.getCategoryExpenses(categoryId);

      if (result.success && Array.isArray(result.data)) {
        // Format dates and store expenses by category ID
        const formattedExpenses = result.data.map((expense) => ({
          ...expense,
          date: expense.date ? expense.date.split("T")[0] : "N/A",
        }));

        setExpenses((prev) => ({ ...prev, [categoryId]: formattedExpenses }));
      }
    } catch (error) {
      console.error(
        `Error fetching expenses for category ${categoryId}:`,
        error
      );
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
              const lastMonth =
                currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
              const lastMonthYear =
                currentDate.getMonth() === 0
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

    // For expense page, show all categories from the selected time filter
    // Categories are already filtered by time when fetched
    setVisibleCategories(categories);
  };

  // Event handlers
  const handleEditExpenseClick = (expense) => {
    // Prevent editing expenses in view-only mode
    if (isViewOnlyMode) {
      toast.info("Editing expenses is only available for the current month.");
      return;
    }

    // Check if user has income
    if (!incomeInfo || !incomeInfo.hasIncome) {
      toast.info("You must add income for this month before editing expenses.");
      return;
    }
    
    setSelectedExpense(expense);
    setIsEditExpenseModalOpen(true);
  };

  const handleEditExpenseSuccess = async (updatedExpense) => {
    setExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) =>
          expense.expenseID === updatedExpense.expenseID
            ? updatedExpense
            : expense
        );
      });
      return updated;
    });

    setFilteredExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) =>
          expense.expenseID === updatedExpense.expenseID
            ? updatedExpense
            : expense
        );
      });
      return updated;
    });

    // Refresh categories data to get updated amounts
    await fetchCategoriesForTimeFilter(activeFilter);

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
    // Find the category details
    const category = categories.find((cat) => cat.categoryID === categoryId);
    const hasExpenses = expenses[categoryId] && expenses[categoryId].length > 0;

    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(category ? category.categoryName : null);
    setCategoryHasExpenses(hasExpenses);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    try {
      const result = await categoryAPI.deleteCategory(selectedCategoryId);

      if (result.success) {
        // Remove the category and its expenses from state
        setCategories((prev) =>
          prev.filter((cat) => cat.categoryID !== selectedCategoryId)
        );

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

        // Remove from category-budget map
        setCategoryBudgetMap((prev) => {
          const updated = { ...prev };
          delete updated[selectedCategoryId];
          return updated;
        });

        setIsDeleteCategoryModalOpen(false);
        setSelectedCategoryId(null);
        toast.success("Category deleted successfully!");
      } else {
        console.error("Failed to delete category:", result.message);
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    }
  };

  const handleAddExpenseClick = (categoryId) => {
    // Prevent adding expenses in view-only mode
    if (isViewOnlyMode) {
      toast.info("Adding expenses is only available for the current month.");
      return;
    }

    // Check if user has income
    if (!incomeInfo || !incomeInfo.hasIncome) {
      toast.info("You must add income for this month before adding expenses.");
      return;
    }
    
    setSelectedCategoryId(categoryId);
    setIsAddExpenseModalOpen(true);
  };

  const handleAddExpenseSuccess = async (newExpense) => {
    setExpenses((prev) => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), newExpense],
    }));

    // Refresh categories data to get updated amounts
    await fetchCategoriesForTimeFilter(activeFilter);

    setIsAddExpenseModalOpen(false);
    toast.success("Expense added successfully!");
  };

  const handleDeleteExpenseClick = (expenseId) => {
    // Prevent deleting expenses in view-only mode
    if (isViewOnlyMode) {
      toast.info("Deleting expenses is only available for the current month.");
      return;
    }

    // Check if user has income
    if (!incomeInfo || !incomeInfo.hasIncome) {
      toast.info("You must add income for this month before deleting expenses.");
      return;
    }
    
    setSelectedExpenseId(expenseId);
    setIsDeleteExpenseModalOpen(true);
  };

  const handleDeleteExpenseConfirm = async () => {
    try {
      const result = await expenseAPI.deleteExpense(selectedExpenseId);

      if (result.success) {
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

        // Refresh categories data to get updated amounts
        await fetchCategoriesForTimeFilter(activeFilter);

        setIsDeleteExpenseModalOpen(false);
        setSelectedExpenseId(null);
        toast.success("Expense deleted successfully!");
      } else {
        console.error("Failed to delete expense:", result.message);
        toast.error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Error deleting expense");
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
    if (categories.length === 0) {
      if (!isViewOnlyMode && (!incomeInfo || !incomeInfo.hasIncome)) {
        return "Add income first, then create budgets to track your expenses.";
      }
      return `No expense categories found for the selected ${
        activeFilter === "thisMonth"
          ? "month"
          : activeFilter === "lastMonth"
            ? "last month"
            : activeFilter === "thisYear"
              ? "year"
              : "period"
      }. Categories are created when you create a budget for that time period.`;
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
    // Initialize data with current filter
    fetchCategoriesForTimeFilter(activeFilter);
    fetchBudgets(); // Keep for compatibility if needed elsewhere
    checkCurrentMonthIncome(); // Check income status
  }, []);

  useEffect(() => {
    // Re-fetch categories when filter changes
    fetchCategoriesForTimeFilter(activeFilter);
    // Check income when switching to current month
    if (activeFilter === "thisMonth") {
      checkCurrentMonthIncome();
    } else {
      setIncomeInfo(null); // Clear income info for historical data
    }
  }, [activeFilter]);

  useEffect(() => {
    applyTimeFilter();
  }, [expenses, categories, activeFilter]);

  const totalExpense = calculateTotalExpense();

  return (
    <>
      <main className={styles.expenseLayout}>
        <div
          className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
        >
          <SideBar onToggleCollapse={handleSidebarToggle} />
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

            {/* Show income status banner when in current month mode */}
            {!isViewOnlyMode && (
              <section className={styles.incomeStatusSection}>
                {incomeInfo && incomeInfo.hasIncome ? (
                  <div className={styles.incomeSuccess}>
                    <span className={styles.incomeIcon}>✓</span>
                    Monthly Income: RM {incomeInfo.totalIncome.toFixed(2)}
                  </div>
                ) : (
                  <div className={styles.incomeWarning}>
                    <span className={styles.incomeIcon}>⚠</span>
                    No income added for this month. Add income first to manage expenses.
                  </div>
                )}
              </section>
            )}

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
                    onDelete={() =>
                      handleDeleteCategoryClick(category.categoryID)
                    }
                    onAddExpense={() =>
                      handleAddExpenseClick(category.categoryID)
                    }
                    expenses={filteredExpenses[category.categoryID] || []}
                    categoryTotal={getCategoryTotal(category.categoryID)}
                    activeFilter={activeFilter}
                    onEditExpense={handleEditExpenseClick}
                    onDeleteExpense={handleDeleteExpenseClick}
                    budgetName={categoryBudgetMap[category.categoryID]}
                    isViewOnly={isViewOnlyMode} // Pass view-only state
                    hasIncomeForMonth={incomeInfo?.hasIncome || false} // Pass income status
                  />
                ))
              ) : (
                <EmptyState message={getEmptyStateMessage()} />
              )}
            </section>

            {/* Modals */}
            {isDeleteExpenseModalOpen && (
              <DeleteExpenseModal
                onCancel={() => setIsDeleteExpenseModalOpen(false)}
                onConfirm={handleDeleteExpenseConfirm}
              />
            )}
          </section>
        </div>

        {/* Add Expense Modal - Only show when not in view-only mode and user has income */}
        {isAddExpenseModalOpen && !isViewOnlyMode && (
          <AddExpenseModal
            categoryId={selectedCategoryId}
            onClose={() => setIsAddExpenseModalOpen(false)}
            onAdd={handleAddExpenseSuccess}
          />
        )}

        {/* Edit Expense Modal - Only show when not in view-only mode and user has income */}
        {isEditExpenseModalOpen && !isViewOnlyMode && (
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