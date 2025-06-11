import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { incomeAPI, profileAPI } from "../services/UserApi";
import styles from "./AddModal.module.css";

export const AddIncomeModal = ({ onClose, onAddIncome }) => {
  const [incomeType, setIncomeType] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [customScholarship, setCustomScholarship] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [occurrence, setOccurrence] = useState("once");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const scholarshipOptions = [
    "Jabatan Perkhidmatan Awam (JPA)",
    "Majlis Amanah Rakyat (MARA)",
    "Yayasan Khazanah",
    "Petronas Education",
    "Other",
  ];

  const occurrenceOptions = [
    { value: "once", label: "One-time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  // Add useEffect to fetch and set user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { success, user } = await profileAPI.getUserDetails();
        if (success && user) {
          // Set income type from profile
          if (user.incomeType) {
            setIncomeType(user.incomeType);
          }

          // Handle scholarship information
          if (user.incomeType === "Passive" && user.scholarshipType) {
            if (
              ["JPA", "MARA", "Yayasan", "Petronas"].includes(
                user.scholarshipType
              )
            ) {
              // For predefined scholarship types
              setScholarship(
                scholarshipOptions.find((opt) => opt.includes(user.scholarshipType)) ||
                  ""
              );
            } else {
              // For custom scholarship
              setScholarship("Other");
              setCustomScholarship(user.scholarshipType);
            }

            // Pre-fill the title with scholarship name
            setTitle(user.scholarshipType);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalTitle = "";
    let finalSource = null;

    if (incomeType === "Passive") {
      if (scholarship === "Other") {
        finalTitle = customScholarship.trim();
        finalSource = "Other";
      } else {
        finalTitle = scholarship;
        finalSource = scholarship;
      }
    } else {
      finalTitle = title;
    }

    const incomeData = {
      type: incomeType,
      title: finalTitle,
      source: finalSource,
      date: startDate,
      amount: parseFloat(amount),
      occurrence,
    };

    try {
      const result = await incomeAPI.addIncome(incomeData);

      toast.success(result.message || "Income added successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });

      if (onAddIncome) {
        onAddIncome();
      }

      onClose();
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error(error.message || "Failed to add income.");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Income</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="incomeType" className={styles.label}>
              Type:
            </label>
            <select
              id="incomeType"
              className={styles.input}
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="Passive">Passive</option>
              <option value="Active">Active</option>
            </select>
          </div>

          {incomeType === "Passive" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="scholarship" className={styles.label}>
                  Scholarship:
                </label>
                <select
                  id="scholarship"
                  className={styles.input}
                  value={scholarship}
                  onChange={(e) => setScholarship(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select scholarship
                  </option>
                  {scholarshipOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {scholarship === "Other" && (
                <div className={styles.formGroup}>
                  <label htmlFor="customScholarship" className={styles.label}>
                    Scholarship Name:
                  </label>
                  <input
                    id="customScholarship"
                    type="text"
                    className={styles.input}
                    placeholder="Enter scholarship name"
                    value={customScholarship}
                    onChange={(e) => setCustomScholarship(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          {incomeType === "Active" && (
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title:
              </label>
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
                <label htmlFor="amount" className={styles.label}>
                  Amount:
                </label>
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
                <label htmlFor="startDate" className={styles.label}>
                  Start Date:
                </label>
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
                <label htmlFor="occurrence" className={styles.label}>
                  Occurrence:
                </label>
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
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={
                !incomeType ||
                !amount ||
                !startDate ||
                (incomeType === "Passive" && !scholarship) ||
                (incomeType === "Passive" &&
                  scholarship === "Other" &&
                  !customScholarship) ||
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
