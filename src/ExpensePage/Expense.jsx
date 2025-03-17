import React, { useState } from "react";
import styles from "./Expense.module.css";
import SidebarNav from "./SideBar";
import { AddExpenseModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";

const initialExpenses = [
  { id: 1, category: "Food", date: "15-11-2024", amount: "150.00", icon: "/food-icon.svg" },
  { id: 2, category: "Transport", date: "16-11-2024", amount: "50.00", icon: "/transport-icon.svg" },
  { id: 3, category: "Shopping", date: "17-11-2024", amount: "200.00", icon: "/shopping-icon.svg" },
  { id: 4, category: "Food", date: "18-11-2024", amount: "120.00", icon: "/food-icon.svg" },
];

export default function Expense({ user }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Calculate total expense
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  // Group expenses by category
  const groupedExpenses = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) acc[expense.category] = [];
    acc[expense.category].push(expense);
    return acc;
  }, {});

  // Calculate total for each category
  const categoryTotals = Object.keys(groupedExpenses).reduce((acc, category) => {
    acc[category] = groupedExpenses[category].reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDeleteCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategoryConfirm = () => {
    setExpenses((prevItems) => prevItems.filter((item) => item.category !== selectedCategory));
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteExpenseClick = (id) => {
    setSelectedExpenseId(id);
    setIsDeleteExpenseModalOpen(true);
  };

  const handleDeleteExpenseConfirm = () => {
    setExpenses((prevItems) => prevItems.filter((item) => item.id !== selectedExpenseId));
    setIsDeleteExpenseModalOpen(false);
    setSelectedExpenseId(null);
  };

  const handleAddCategory = (category) => {
    // Add new expense with the new category
    const newId = expenses.length + 1;
    const newCategory = { id: newId, category, date: "N/A", amount: "0.00" };

    setExpenses((prev) => [...prev, newCategory]);
  };

  return (
    <>
      <main className={styles.expenseLayout}>
        <div className={styles.content}>
          <SidebarNav />
          <section className={styles.main}>
            <header className={styles.headerSection}>
              <h1 className={styles.pageHeader}>Hello, {user ? user.name : "Guest"}!</h1>
            </header>

            {/* Total Expense Section */}
            <section className={styles.content3}>
              <form className={styles.totalExpense}>
                <label htmlFor="totalExpense" className={styles.labelM}>
                  Total Expense
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
              {Object.keys(groupedExpenses).map((category) => (
                <div key={category} className={styles.categoryContainer}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryTitle}>{category}</h3>
                      <span className={styles.categoryTotal}>
                        RM {categoryTotals[category].toFixed(2)}
                      </span>
                      <button
                        className={styles.expandButton}
                        onClick={() => toggleCategory(category)}
                      >
                        <img
                          src="/chevron-right.svg"
                          alt="Expand"
                          className={`${styles.chevronIcon} ${expandedCategories[category] ? styles.expanded : ""}`}
                        />
                      </button>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.iconButton}
                        onClick={() => console.log("Add expense clicked")}
                      >
                        <img src="/add-icon.svg" alt="Add" />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => console.log("Edit category clicked")}
                      >
                        <img src="/edit-icon.svg" alt="Edit" />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleDeleteCategoryClick(category)}
                      >
                        <img src="/delete-icon.svg" alt="Delete" />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category] && (
                    <div className={styles.expenseList}>
                      {groupedExpenses[category].map((expense) => (
                        <article key={expense.id} className={styles.expenseItem}>
                          <div className={styles.expenseDetails}>
                            <div className={styles.textDetails}>
                              <h4 className={styles.expenseDate}>{expense.date}</h4>
                            </div>
                          </div>
                          <div className={styles.amountDisplay}>
                            <span className={styles.currency}>RM</span>
                            <span className={styles.expenseAmount}>{expense.amount}</span>
                          </div>
                          <div className={styles.actionButtons}>
                            <button className={styles.iconButton} onClick={() => console.log("Edit clicked")}>
                              <img src="/edit-icon.svg" alt="Edit" />
                            </button>
                            <button
                              className={styles.iconButton}
                              onClick={() => handleDeleteExpenseClick(expense.id)}
                            >
                              <img src="/delete-icon.svg" alt="Delete" />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section className={styles.addCategoryButton}>
              <button
                className={styles.addExpenseButton}
                onClick={() => setIsModalOpen(true)}
              >
                <img src="/add-icon.svg" alt="Add" />
                <span>Add Category</span>
              </button>
            </section>

            {isDeleteModalOpen && (
              <DeleteModal
                onCancel={() => setIsDeleteModalOpen(false)}
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

        {isModalOpen && (
          <AddExpenseModal
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddCategory}
          />
        )}
      </main>
    </>
  );
}
