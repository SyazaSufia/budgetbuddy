import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./AddModal.module.css";

export const AddIncomeModal = ({ onClose }) => {
  const [incomeType, setIncomeType] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState(""); // Add title state

  const scholarshipOptions = [
    "Jabatan Perkhidmatan Awam (JPA)",
    "Majlis Amanah Rakyat (MARA)",
    "Yayasan Khazanah",
    "Petronas Education",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newIncome = {
      type: incomeType,
      title: incomeType === "Passive" ? scholarship || "Custom Income" : title, // Use scholarship or title
      source: incomeType === "Passive" ? scholarship || null : null, // Source for passive income only
      date: new Date().toISOString().split("T")[0], // Current date
      amount,
    };

    try {
      const response = await fetch("http://localhost:8080/income/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIncome),
        credentials: "include", // Ensure session cookies are sent
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
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={!incomeType || !amount || (incomeType === "Passive" && !scholarship) || (incomeType === "Active" && !title)}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};