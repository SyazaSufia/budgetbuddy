import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

export const AddIncomeModal = ({ onClose, onAddIncome }) => {
  const [incomeType, setIncomeType] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [customScholarship, setCustomScholarship] = useState(""); // New state for custom scholarship title
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [occurrence, setOccurrence] = useState("once"); // Default to one-time payment
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]); // Default to today

  const scholarshipOptions = [
    "Jabatan Perkhidmatan Awam (JPA)",
    "Majlis Amanah Rakyat (MARA)",
    "Yayasan Khazanah",
    "Petronas Education",
    "Other"
  ];

  const occurrenceOptions = [
    { value: "once", label: "One-time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine the title based on income type and selections
    let finalTitle = "";
    let finalSource = null;

    if (incomeType === "Passive") {
      if (scholarship === "Other") {
        // For custom scholarships
        finalTitle = customScholarship.trim();
        finalSource = "Other";
      } else {
        // For predefined scholarships
        finalTitle = scholarship;
        finalSource = scholarship;
      }
    } else {
      // For Active income
      finalTitle = title;
    }

    const incomeData = {
      type: incomeType,
      title: finalTitle,
      source: finalSource,
      date: startDate,
      amount,
      occurrence,
    };

    try {
      const response = await fetch("http://localhost:8080/income/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incomeData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Income added successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        
        // Call the onAddIncome callback after successful addition
        if (onAddIncome) {
          onAddIncome();
        }
        
        onClose(); // Close the modal after successful submission
      } else {
        toast.error(result.error || "Failed to add income.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Income</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="incomeType" className={styles.label}>Type:</label>
            <select
              id="incomeType"
              className={styles.input}
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
              required
            >
              <option value="" disabled>Select type</option>
              <option value="Passive">Passive</option>
              <option value="Active">Active</option>
            </select>
          </div>

          {incomeType === "Passive" && (
            <div className={styles.formGroup}>
              <label htmlFor="scholarship" className={styles.label}>Scholarship:</label>
              <select
                id="scholarship"
                className={styles.input}
                value={scholarship}
                onChange={(e) => setScholarship(e.target.value)}
                required
              >
                <option value="" disabled>Select scholarship</option>
                {scholarshipOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {/* New custom scholarship input field */}
          {incomeType === "Passive" && scholarship === "Other" && (
            <div className={styles.formGroup}>
              <label htmlFor="customScholarship" className={styles.label}>Custom Scholarship Title:</label>
              <input
                id="customScholarship"
                type="text"
                className={styles.input}
                placeholder="Enter custom scholarship title"
                value={customScholarship}
                onChange={(e) => setCustomScholarship(e.target.value)}
                required
              />
            </div>
          )}

          {incomeType === "Active" && (
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>Title:</label>
              <input
                id="title"
                type="text"
                className={styles.input}
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          )}

          {incomeType && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="amount" className={styles.label}>Amount:</label>
                <input
                  id="amount"
                  type="number"
                  className={styles.input}
                  placeholder="RM 0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="startDate" className={styles.label}>Start Date:</label>
                <input
                  id="startDate"
                  type="date"
                  className={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="occurrence" className={styles.label}>Occurrence:</label>
                <select
                  id="occurrence"
                  className={styles.input}
                  value={occurrence}
                  onChange={(e) => setOccurrence(e.target.value)}
                  required
                >
                  {occurrenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={
                !incomeType || 
                !amount || 
                !startDate || 
                (incomeType === "Passive" && !scholarship) || 
                (incomeType === "Passive" && scholarship === "Other" && !customScholarship) ||
                (incomeType === "Active" && !title)
              }
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};