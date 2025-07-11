import React, { useState, useEffect } from "react";
import { incomeAPI } from "../services/UserApi";
import styles from "./Income.module.css";
import { AddIncomeModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import EditIncomeModal from "./EditIncomeModal";

export default function IncomeList({
  onUpdateTotalIncome,
  activeFilter,
  refreshTrigger,
  onRefresh,
}) {
  const [incomeItems, setIncomeItems] = useState([]);
  const [filteredIncomeItems, setFilteredIncomeItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [isRecurringIncome, setIsRecurringIncome] = useState(false);
  const [updateAllRecurrences, setUpdateAllRecurrences] = useState(false);

  // Check if the current filter allows editing (only "thisMonth" allows editing)
  const isReadOnlyMode = activeFilter !== "thisMonth";

  // Fetch incomes from the backend using API
  const fetchIncomes = async () => {
    try {
      const incomes = await incomeAPI.getIncome();

      // Format dates properly to avoid timezone issues
      const formattedIncomes = incomes.map((item) => {
        // Parse the date into year, month, day components
        const dateParts = item.date.split("T")[0].split("-");
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
        const day = parseInt(dateParts[2]);

        // Create a date object that preserves the exact date regardless of timezone
        const fixedDate = new Date(year, month, day);

        return {
          ...item,
          date: item.date.split("T")[0], // Keep formatted date string for display
          dateObj: fixedDate, // Add proper date object for filtering
        };
      });
      setIncomeItems(formattedIncomes); // Populate the income list
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [refreshTrigger]);

  // Apply time filter whenever activeFilter or incomeItems change
  useEffect(() => {
    if (!incomeItems.length) return;

    const currentDate = new Date();
    const filteredItems = incomeItems.filter((item) => {
      // Use the dateObj property which has the correct date
      const itemDate = item.dateObj;

      switch (activeFilter) {
        case "thisMonth": {
          // Current month
          return (
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          );
        }
        case "lastMonth": {
          // Last month
          const lastMonth =
            currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
          const lastMonthYear =
            currentDate.getMonth() === 0
              ? currentDate.getFullYear() - 1
              : currentDate.getFullYear();
          return (
            itemDate.getMonth() === lastMonth &&
            itemDate.getFullYear() === lastMonthYear
          );
        }
        case "thisYear": {
          // Current year
          return itemDate.getFullYear() === currentDate.getFullYear();
        }
        case "last12Months": {
          // Last 12 months
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
          return itemDate >= twelveMonthsAgo;
        }
        default:
          return true;
      }
    });

    setFilteredIncomeItems(filteredItems);

    // Calculate and update total income based on filtered items
    const total = filteredItems.reduce(
      (acc, item) => acc + parseFloat(item.amount),
      0
    );
    onUpdateTotalIncome(total);
  }, [activeFilter, incomeItems, onUpdateTotalIncome]);

  // Handle delete button click (only works in edit mode)
  const handleDeleteClick = (id, isRecurring = false) => {
    if (isReadOnlyMode) return; // Prevent action in read-only mode
    
    setSelectedIncomeId(id);
    setIsRecurringIncome(isRecurring);
    setIsDeleteModalOpen(true);
  };

  // Confirm income deletion using API
  const handleDeleteConfirm = async (deleteAllRecurrences = false) => {
    try {
      // Use the API method instead of direct fetch
      await incomeAPI.deleteIncome(selectedIncomeId);
      
      fetchIncomes(); // Reload incomes after deletion
      setIsDeleteModalOpen(false);
      setSelectedIncomeId(null);

      // Notify parent component of refresh
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      
      // Handle specific error cases
      if (error.message.includes("has children") || error.message.includes("recurring")) {
        alert(
          "This income has recurring instances. Please select 'Delete all recurrences' option."
        );
      }
    }
  };

  // Handle edit button click (only works in edit mode)
  const handleEditClick = (income) => {
    if (isReadOnlyMode) return; // Prevent action in read-only mode
    
    setCurrentIncome(income);
    setIsEditModalOpen(true);
    // Reset the update all recurrences flag
    setUpdateAllRecurrences(false);
  };

  // Confirm income update
  const handleUpdateIncome = async (
    updatedIncome,
    updateAllRecurrences = false
  ) => {
    try {
      await fetchIncomes(); // Auto-refresh after update
      setIsEditModalOpen(false);

      // Notify parent component of refresh
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating income:", error);
    }
  };

  // Add income modal callback (only works in edit mode)
  const handleAddIncome = async () => {
    try {
      await fetchIncomes(); // Auto-refresh after adding a new one
      setIsModalOpen(false);
      // Notify parent component that refresh occurred
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  // Format occurrence text for display
  const formatOccurrence = (occurrence) => {
    if (!occurrence || occurrence === "once") return null;
    return occurrence.charAt(0).toUpperCase() + occurrence.slice(1);
  };

  // Render recurring income badge if needed
  const renderRecurringBadge = (item) => {
    if (!item.isRecurring) return null;

    return (
      <div className={styles.recurringBadge}>
        {item.parentIncomeID ? "Part of recurring series" : "Recurring income"}
      </div>
    );
  };

  return (
    <section className={styles.incomeLists}>
      <h2 className={styles.title}>
        All Income {isReadOnlyMode && <span className={styles.readOnlyLabel}>(View Only)</span>}
      </h2>
      <div className={styles.content4}>
        {filteredIncomeItems.length > 0 ? (
          filteredIncomeItems.map((item) => (
            <article key={item.incomeID} className={styles.incomeLists2}>
              <div className={styles.content5}>
                <h3 className={styles.title2}>{item.title}</h3>
                <div className={styles.leftContent}>
                  <p className={styles.type}>Type: {item.type}</p>
                  <time className={styles.date}>{item.date}</time>

                  {/* Display occurrence information if it's recurring */}
                  {item.occurrence && item.occurrence !== "once" && (
                    <p className={styles.occurrence}>
                      <span className={styles.occurrenceLabel}>
                        Recurring:{" "}
                      </span>
                      <span className={styles.occurrenceValue}>
                        {formatOccurrence(item.occurrence)}
                      </span>
                    </p>
                  )}

                  {renderRecurringBadge(item)}

                  <div className={styles.amount}>
                    <span className={styles.currency}>RM</span>
                    <span className={styles.amount}>{item.amount}</span>
                  </div>
                </div>
                
                {/* Only show action buttons in edit mode (thisMonth filter) */}
                {!isReadOnlyMode && (
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
                      onClick={() =>
                        handleDeleteClick(item.incomeID, item.isRecurring)
                      }
                    >
                      <img loading="lazy" src="/delete-icon.svg" alt="Delete" />
                    </button>
                  </div>
                )}
                
                {/* Show disabled buttons in read-only mode for visual consistency */}
                {isReadOnlyMode && (
                  <div className={styles.icons}>
                    <button
                      className={`${styles.iconButton} ${styles.disabledButton}`}
                      aria-label="Edit income (disabled)"
                      disabled
                      title="Editing is only available for current month entries"
                    >
                      <img loading="lazy" src="/edit-icon.svg" alt="Edit" />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.disabledButton}`}
                      aria-label="Delete income (disabled)"
                      disabled
                      title="Deleting is only available for current month entries"
                    >
                      <img loading="lazy" src="/delete-icon.svg" alt="Delete" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <img
              src="/empty-illustration.svg"
              alt="No income"
              className={styles.emptyIllustration}
            />
            <p className={styles.noIncome}>
              No income entries found for this period.
            </p>
          </div>
        )}
      </div>

      {/* Only show Add Income button when not in read-only mode */}
      {!isReadOnlyMode && (
        <button
          className={styles.addIncomeButton}
          onClick={() => setIsModalOpen(true)}
        >
          <img loading="lazy" src="/add-icon.svg" alt="Add" />
          <span>Add Income</span>
        </button>
      )}

      {/* Modals - only functional when not in read-only mode */}
      {isModalOpen && !isReadOnlyMode && (
        <AddIncomeModal
          onClose={() => setIsModalOpen(false)}
          onAddIncome={handleAddIncome}
        />
      )}
      {isDeleteModalOpen && !isReadOnlyMode && (
        <DeleteModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isRecurring={isRecurringIncome}
        />
      )}
      {isEditModalOpen && !isReadOnlyMode && (
        <EditIncomeModal
          income={currentIncome}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateIncome}
          showRecurringOptions={currentIncome?.isRecurring}
        />
      )}
    </section>
  );
}