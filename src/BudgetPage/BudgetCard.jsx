import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BudgetCard.module.css";
import { CreateBudgetModal } from "./CreateModal";

function BudgetCard() {
  const navigate = useNavigate(); // React Router navigation
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    navigate("/budgetdetails");
  };

  return (
    <div className={styles.cardContainer}>
      {/* Budget Card - Click to Navigate */}
      <div className={styles.card} onClick={handleCardClick} style={{ cursor: "pointer" }}>
        <div className={styles.iconWrapper}>
          <img src="/shopping-icon.svg" alt="Shopping Icon" width={50} height={50} />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.title}>Shopping</div>
          <div className={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} />
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <section className={styles.createBudgetButton}>
        <button className={styles.addBudgetButton} onClick={() => setIsModalOpen(true)}>
          <img src="/add-icon.svg" alt="Add" />
          <span>Create New Budget</span>
        </button>
      </section>

      {/* Show Modal if Open */}
      {isModalOpen && <CreateBudgetModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default BudgetCard;
