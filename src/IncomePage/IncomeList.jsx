import React, { useState, useEffect } from "react";
import styles from "./Income.module.css";
import { AddIncomeModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import EditIncomeModal from "./EditIncomeModal";

export default function IncomeList({ onUpdateTotalIncome }) {
  const [incomeItems, setIncomeItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);

  // Fetch incomes from the backend
  const fetchIncomes = async () => {
    try {
      const response = await fetch("http://localhost:8080/income", {
        credentials: "include", // Send session cookies
      });
      const incomes = await response.json();

      if (response.ok) {
        // Format date to 'YYYY-MM-DD' and update income items
        const formattedIncomes = incomes.map((item) => ({
          ...item,
          date: item.date.split("T")[0], // Remove timestamp
        }));
        setIncomeItems(formattedIncomes); // Populate the income list
        const total = formattedIncomes.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        onUpdateTotalIncome(total); // Update total income
      } else {
        console.error("Failed to fetch incomes:", incomes.error);
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setSelectedIncomeId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm income deletion
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:8080/income/delete/${selectedIncomeId}`, {
        method: "DELETE",
        credentials: "include", // Send session cookies
      });

      if (response.ok) {
        fetchIncomes(); // Reload incomes after deletion
        setIsDeleteModalOpen(false);
        setSelectedIncomeId(null);
      } else {
        console.error("Failed to delete income");
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  // Handle edit button click
  const handleEditClick = (income) => {
    setCurrentIncome(income);
    setIsEditModalOpen(true);
  };

  // Confirm income update
  const handleUpdateIncome = async () => {
    try {
      await fetchIncomes(); // Auto-refresh after update
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating income:", error);
    }
  };

  // Add income modal callback
  const handleAddIncome = async () => {
    try {
      await fetchIncomes(); // Auto-refresh after adding a new one
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  return (
    <section className={styles.incomeLists}>
      <h2 className={styles.title}>All Income</h2>
      <div className={styles.content4}>
        {incomeItems.map((item) => (
          <article key={item.incomeID} className={styles.incomeLists2}>
            <div className={styles.content5}>
              <h3 className={styles.title2}>{item.title}</h3>
              <div className={styles.leftContent}>
                <p className={styles.type}>Type: {item.type}</p>
                <time className={styles.date}>{item.date}</time>
                <div className={styles.amount}>
                  <span className={styles.currency}>RM</span>
                  <span className={styles.amount}>{item.amount}</span>
                </div>
              </div>
              <div className={styles.icons}>
                <button
                  className={styles.iconButton}
                  aria-label="Edit income"
                  onClick={() => handleEditClick(item)}
                >
                  <img loading="lazy" src="/edit-icon.svg" alt="Edit" />
                </button>
                <button
                  className={styles.iconButton}
                  aria-label="Delete income"
                  onClick={() => handleDeleteClick(item.incomeID)}
                >
                  <img loading="lazy" src="/delete-icon.svg" alt="Delete" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className={styles.addIncomeButton} onClick={() => setIsModalOpen(true)}>
        <img loading="lazy" src="/add-icon.svg" alt="Add" />
        <span>Add Income</span>
      </button>

      {isModalOpen && <AddIncomeModal onClose={() => setIsModalOpen(false)} onAddIncome={handleAddIncome} />}
      {isDeleteModalOpen && (
        <DeleteModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {isEditModalOpen && (
        <EditIncomeModal
          income={currentIncome}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateIncome}
        />
      )}
    </section>
  );
}