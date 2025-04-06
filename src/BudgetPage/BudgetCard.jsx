import React, { useState, useEffect } from "react";
import styles from "./BudgetCard.module.css";
import { CreateBudgetModal } from "./CreateModal";
import { useNavigate } from "react-router-dom"; // Add useNavigate hook

function BudgetCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    // Fetch budgets from the backend
    fetch("http://localhost:8080/budget/budgets", {
      credentials: "include", // Send cookies/session info
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setBudgets(data.data); // Set the fetched budgets
        } else {
          console.error("Failed to load budgets:", data.message);
        }
      })
      .catch((err) => {
        console.error("Error loading budgets:", err);
        alert("Error loading budgets. Please try again later.");
      });
  }, []);

  // Handle adding a new budget
  const handleAddBudget = (newBudget) => {
    setBudgets((prev) => [...prev, newBudget]); // Add new budget to state
  };

  return (
    <div className={styles.cardContainer}>
      {/* Render each budget as a card */}
      {budgets.map((budget) => (
        <div
          key={budget.budgetID}
          className={styles.card}
          onClick={() => navigate("/budgetdetails")} // Navigate to budget details page
        >
          <div className={styles.iconWrapper}>
            <img
              src={budget.icon || "/default-icon.svg"} // Use a default icon if budget icon is missing
              alt={budget.categoryName}
              width={50}
              height={50}
            />
          </div>
          <div className={styles.contentContainer}>
            <div className={styles.title}>{budget.categoryName}</div>
            <div className={styles.description}>
              This is a budget for {budget.categoryName}.
            </div>
            <div className={styles.progressBarContainer}>
              {/* Example of progress bar, needs dynamic styling based on budget progress */}
              <div
                className={styles.progressBar}
                style={{ width: `${(budget.spent / budget.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Button to create new budget */}
      <section className={styles.createBudgetButton}>
        <button className={styles.addBudgetButton} onClick={() => setIsModalOpen(true)}>
          <img src="/add-icon.svg" alt="Add" />
          <span>Create New Budget</span>
        </button>
      </section>

      {/* Modal for creating a new budget */}
      {isModalOpen && <CreateBudgetModal onClose={() => setIsModalOpen(false)} onAdd={handleAddBudget} />}
    </div>
  );
}

export default BudgetCard;
