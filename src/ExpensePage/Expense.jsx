import React, { useState, useEffect } from "react";
import styles from "./Expense.module.css";
import SidebarNav from "./SideBar";
import { AddModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { EditExpenseModal } from "./EditExpenseModal";
import TimeFilter from "./TimeFilter";
import { toast } from "react-toastify";

export default function Expense({ user }) {
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
  const [activeFilter, setActiveFilter] = useState('thisMonth'); // Default filter
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Handle edit expense click
  const handleEditExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setIsEditExpenseModalOpen(true);
  };

  // Handle successful edit
  const handleEditExpenseSuccess = async (updatedExpense) => {
    // Update the expenses in state
    setExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) => 
          expense.expenseID === updatedExpense.expenseID ? updatedExpense : expense
        );
      });
      return updated;
    });
    
    // Also update filtered expenses
    setFilteredExpenses((prevExpenses) => {
      const updated = {};
      Object.keys(prevExpenses).forEach((categoryId) => {
        updated[categoryId] = prevExpenses[categoryId].map((expense) => 
          expense.expenseID === updatedExpense.expenseID ? updatedExpense : expense
        );
      });
      return updated;
    });
    
    // Re-fetch categories to update the categoryAmount
    await fetchCategories();
    
    setIsEditExpenseModalOpen(false);
    setSelectedExpense(null);
    
    toast.success("Expense updated successfully!");
  };

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/expense/categories", {
        credentials: "include", // Send session cookies
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
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
      for (const category of result.data) {
        await fetchCategoryExpenses(category.categoryID || category.id);
      }
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
        console.warn(
          `Failed to fetch expenses for category ${categoryId} - status: ${response.status}`
        );
        // Initialize with empty array if fetch fails
        setExpenses((prev) => ({
          ...prev,
          [categoryId]: [],
        }));
        return;
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
      // Initialize with empty array if fetch fails
      setExpenses((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on component mount
  }, []);

  // Apply time filter whenever activeFilter or expenses change
  useEffect(() => {
    if (Object.keys(expenses).length === 0) return;
    
    const currentDate = new Date();
    const filtered = {};
    
    // Process each category's expenses
    Object.keys(expenses).forEach(categoryId => {
      filtered[categoryId] = expenses[categoryId].filter(expense => {
        if (!expense.date || expense.date === "N/A") return false;
        
        const expenseDate = new Date(expense.date);
        
        switch (activeFilter) {
          case 'thisMonth': {
            // Current month
            return expenseDate.getMonth() === currentDate.getMonth() && 
                   expenseDate.getFullYear() === currentDate.getFullYear();
          }
          case 'lastMonth': {
            // Last month
            const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
            const lastMonthYear = currentDate.getMonth() === 0 ? 
                                 currentDate.getFullYear() - 1 : 
                                 currentDate.getFullYear();
            return expenseDate.getMonth() === lastMonth && 
                   expenseDate.getFullYear() === lastMonthYear;
          }
          case 'thisYear': {
            // Current year
            return expenseDate.getFullYear() === currentDate.getFullYear();
          }
          case 'last12Months': {
            // Last 12 months
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
            return expenseDate >= twelveMonthsAgo;
          }
          default:
            return true;
        }
      });
    });
    
    setFilteredExpenses(filtered);

    // Create a list of categories that have expenses for the current filter
    const categoriesWithExpenses = categories.filter(category => {
      const categoryExpenses = filtered[category.categoryID] || [];
      return categoryExpenses.length > 0;
    });
    
    setVisibleCategories(categoriesWithExpenses);
  }, [activeFilter, expenses, categories]);

  // Calculate total expense across all filtered categories
  const totalExpense = Object.values(filteredExpenses)
    .flat()
    .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  // Calculate total for each category based on filtered expenses
  const getCategoryTotal = (categoryId) => {
    return (filteredExpenses[categoryId] || []).reduce(
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

        setFilteredExpenses((prevExpenses) => {
          const updatedExpenses = { ...prevExpenses };
          delete updatedExpenses[selectedCategoryId];
          return updatedExpenses;
        });

        setVisibleCategories((prevVisibleCategories) =>
          prevVisibleCategories.filter((cat) => cat.categoryID !== selectedCategoryId)
        );

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
  const handleAddExpenseSuccess = async (newExpense) => {
    // Step 1: Update the state with the new expense optimistically
    setExpenses((prev) => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), newExpense],
    }));

    // Step 2: Refresh all data after adding an expense
    try {
      // Re-fetch all categories to get updated categoryAmount values
      await fetchCategories();

      // Show success toast
      toast.success("Expense added successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
    }

    // Close modal
    setIsAddExpenseModalOpen(false);
  };

  // Update category amount after adding an expense
  const updateCategoryAmount = (categoryId, amount) => {
    amount = parseFloat(amount) || 0; // Ensure amount is a number

    setCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.categoryID === categoryId) {
          const currentAmount = parseFloat(category.categoryAmount) || 0;
          return {
            ...category,
            categoryAmount: currentAmount + amount,
          };
        }
        return category;
      })
    );
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
        // Remove expense from local state
        setExpenses((prevExpenses) => {
          const updated = {};
          Object.keys(prevExpenses).forEach((categoryId) => {
            updated[categoryId] = prevExpenses[categoryId].filter(
              (expense) => expense.expenseID !== selectedExpenseId
            );
          });
          return updated;
        });
        
        // Also update filtered expenses
        setFilteredExpenses((prevExpenses) => {
          const updated = {};
          Object.keys(prevExpenses).forEach((categoryId) => {
            updated[categoryId] = prevExpenses[categoryId].filter(
              (expense) => expense.expenseID !== selectedExpenseId
            );
          });
          return updated;
        });
        
        // Re-fetch categories to update the categoryAmount
        await fetchCategories();
        
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

  const handleAddCategory = () => {
    fetchCategories(); // Re-fetch everything properly from backend
  };

  const handleAddExpenseClick = (categoryId) => {
    setSelectedCategoryId(categoryId); // Set category to add expense for
    setIsAddExpenseModalOpen(true);
  };

  return (
    <>
      <main className={styles.expenseLayout}>
        <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <SidebarNav onToggleCollapse={handleSidebarToggle} />
          <section className={styles.main}>
            <header className={styles.headerSection}>
              <h1 className={styles.pageHeader}>
                Hello, {user ? user.name : "Guest"}!
              </h1>
              <div className={styles.filterContainer}>
                {/* Add TimeFilter component at the top right */}
                <TimeFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
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
              {visibleCategories.length > 0 ? (
                visibleCategories.map((category) => (
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
                        {(filteredExpenses[category.categoryID] || []).length > 0 ? (
                          (filteredExpenses[category.categoryID] || []).map((expense) => (
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
                                    <button 
                                      className={styles.iconButton}
                                      onClick={() => handleEditExpenseClick(expense)}
                                    >
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
                          ))
                        ) : (
                          <div className={styles.emptyState}>
                            <img 
                              src="/empty-illustration.svg" 
                              alt="No expenses" 
                              className={styles.emptyIllustration} 
                            />
                            <p className={styles.noExpenses}>
                              No expenses for this {activeFilter === 'thisMonth' ? 'month' : 
                                activeFilter === 'lastMonth' ? 'last month' :
                                activeFilter === 'thisYear' ? 'year' : 'period'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <img 
                    src="/empty-illustration.svg" 
                    alt="No categories" 
                    className={styles.emptyIllustration} 
                  />
                  <p className={styles.noCategories}>
                    {categories.length === 0 
                      ? "No expense categories found. Create a category to get started."
                      : `No expenses found for the selected ${activeFilter === 'thisMonth' ? 'month' : 
                          activeFilter === 'lastMonth' ? 'last month' :
                          activeFilter === 'thisYear' ? 'year' : 'period'}.`
                    }
                  </p>
                </div>
              )}

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
            updateCategoryAmount={updateCategoryAmount}
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