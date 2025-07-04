import React, { useState, useEffect } from "react";
import styles from "./AddModal.module.css";
import { toast } from "react-toastify";
import ReceiptScanner from "./ReceiptScanner";
import { expenseAPI, categoryAPI, incomeAPI } from "../services/UserApi";

export const AddExpenseModal = ({
  onClose,
  onAdd,
  categoryId,
  updateCategoryAmount,
}) => {
  const [expenseItems, setExpenseItems] = useState([
    { tempId: `temp-${Date.now()}`, title: "", amount: "" }
  ]);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [incomeInfo, setIncomeInfo] = useState(null);
  const [isCheckingIncome, setIsCheckingIncome] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState(null);

  // Check income and expense summary when modal opens
  useEffect(() => {
    const checkIncomeAndExpenseInfo = async () => {
      try {
        setIsCheckingIncome(true);
        
        // Get current month/year
        const now = new Date();
        const expenseMonth = now.getMonth() + 1;
        const expenseYear = now.getFullYear();

        // Check if user has income for the current month
        const incomeCheck = await incomeAPI.checkMonthlyIncomeExists(expenseMonth, expenseYear);
        
        if (incomeCheck.success) {
          setIncomeInfo({
            hasIncome: incomeCheck.data.hasIncome,
            totalIncome: incomeCheck.data.totalIncome,
            month: expenseMonth,
            year: expenseYear
          });

          if (incomeCheck.data.hasIncome) {
            // Get current expense summary
            const expenseSummaryData = await expenseAPI.getMonthlyExpenseSummary(expenseMonth, expenseYear);
            if (expenseSummaryData.success) {
              setExpenseSummary({
                totalExpenses: expenseSummaryData.data.monthlyExpenseTotal,
                remainingIncome: expenseSummaryData.data.remainingIncome
              });
            }
          }
        }
      } catch (err) {
        console.error("Error checking income and expenses:", err);
        setIncomeInfo({ hasIncome: false, totalIncome: 0 });
      } finally {
        setIsCheckingIncome(false);
      }
    };

    checkIncomeAndExpenseInfo();
  }, []);

  // Calculate projected remaining income when expense amounts change
  const calculateProjectedRemainingIncome = () => {
    if (incomeInfo && incomeInfo.hasIncome && expenseSummary) {
      const totalNewExpenses = expenseItems.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
      
      return expenseSummary.remainingIncome - totalNewExpenses;
    }
    return null;
  };

  const projectedRemainingIncome = calculateProjectedRemainingIncome();

  const handleSubmit = async () => {
    // Check if user has income
    if (!incomeInfo || !incomeInfo.hasIncome) {
      toast.error("You must add income for this month before adding expenses.");
      return;
    }

    // Validate form
    const validItems = expenseItems.filter(item => {
      const trimmedTitle = item.title.trim();
      return trimmedTitle && item.amount;
    });

    if (validItems.length === 0) {
      toast.error("Please add at least one valid expense with title and amount.");
      return;
    }

    if (!categoryId) {
      toast.error("No category selected!");
      console.error("Missing categoryId for expense");
      return;
    }

    // Get current date for all expenses
    const currentDate = new Date().toISOString().split("T")[0];

    // Validate each expense against income
    for (const item of validItems) {
      try {
        const validation = await expenseAPI.validateExpenseAddition({
          categoryID: categoryId,
          amount: parseFloat(item.amount),
          date: currentDate
        });

        if (!validation.success) {
          if (validation.code === "NO_INCOME") {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            toast.error(`You must add income for ${month}/${year} before adding expenses for that month.`);
          } else if (validation.code === "EXCEEDS_INCOME") {
            toast.error(validation.message);
          } else {
            toast.error(validation.message || "Unable to add expense.");
          }
          return;
        }
      } catch (err) {
        console.error("Error validating expense:", err);
        toast.error("Error validating expense. Please try again.");
        return;
      }
    }

    // Check budget limits
    let totalAmount = 0;
    for (const item of validItems) {
      totalAmount += parseFloat(item.amount);
    }
    
    const shouldProceed = await checkBudgetLimits(categoryId, totalAmount);
    if (!shouldProceed) return;

    // Submit all valid expense items
    try {
      const successfulItems = [];
      const errors = [];

      // Process each valid expense item
      for (const item of validItems) {
        const trimmedTitle = item.title.trim();

        try {
          const payload = {
            categoryID: categoryId,
            title: trimmedTitle,
            amount: parseFloat(item.amount),
            date: currentDate,
          };

          // Use the API method instead of direct fetch
          const result = await expenseAPI.addExpense(payload);

          if (result.success) {
            // Create new expense object with the data from the server response
            const newExpense = {
              expenseID: result.data.expenseID || Date.now(),
              categoryID: categoryId,
              title: trimmedTitle,
              amount: parseFloat(item.amount),
              date: currentDate,
            };

            successfulItems.push(newExpense);
          } else {
            if (result.code === "NO_INCOME") {
              errors.push(`"${trimmedTitle}": You must add income for this month first.`);
            } else if (result.code === "EXCEEDS_INCOME") {
              errors.push(`"${trimmedTitle}": ${result.message}`);
            } else {
              errors.push(`Error with "${trimmedTitle}": ${result.message || "Unknown error"}`);
            }
          }
        } catch (error) {
          if (error.message.includes("NO_INCOME")) {
            errors.push(`"${trimmedTitle}": You must add income for this month first.`);
          } else if (error.message.includes("EXCEEDS_INCOME")) {
            errors.push(`"${trimmedTitle}": Expense would exceed monthly income.`);
          } else {
            errors.push(`Error with "${trimmedTitle}": ${error.message}`);
          }
        }
      }

      // Show results
      if (successfulItems.length > 0) {
        // Update the category amount optimistically
        if (updateCategoryAmount && successfulItems.length > 0) {
          const totalAdded = successfulItems.reduce((sum, item) => sum + item.amount, 0);
          updateCategoryAmount(categoryId, totalAdded);
        }

        // Call the parent component's handler with the new expenses
        for (const item of successfulItems) {
          onAdd(item);
        }

        if (errors.length > 0) {
          // Some succeeded, some failed
          toast.warning(`Added ${successfulItems.length} expense(s), but ${errors.length} failed`);
        } else {
          // All succeeded
          toast.success(`Successfully added ${successfulItems.length} expense(s)`);
        }

        // Close modal
        onClose();
      } else if (errors.length > 0) {
        // All failed
        toast.error(`Failed to add expenses: ${errors.join(", ")}`);
      }
    } catch (error) {
      console.error("Error caught:", error);
      toast.error("Error adding expenses: " + error.message);
    }
  };

  // Handle adding new expense item form
  const addNewExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      { tempId: `temp-${Date.now()}`, title: "", amount: "" }
    ]);
  };

  // Handle removing an expense item
  const removeExpenseItem = (tempId) => {
    if (expenseItems.length === 1) {
      // Don't remove the last item, just clear it
      setExpenseItems([
        { tempId: `temp-${Date.now()}`, title: "", amount: "" }
      ]);
    } else {
      setExpenseItems(expenseItems.filter(item => item.tempId !== tempId));
    }
  };

  // Handle expense item field changes
  const handleItemChange = (tempId, field, value) => {
    setExpenseItems(expenseItems.map(item => 
      item.tempId === tempId ? { ...item, [field]: value } : item
    ));
  };

  // Handle receipt data from scanner
  const handleReceiptProcessed = (receivedItems) => {
    // Check if we got an array of items or a single item
    const itemsArray = Array.isArray(receivedItems) ? receivedItems : [receivedItems];
    
    if (itemsArray.length > 0) {
      // Replace existing items with scanned items
      setExpenseItems(itemsArray.map(item => ({
        tempId: item.tempId || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || "",
        amount: typeof item.amount === 'number' ? item.amount.toString() : item.amount || "",
      })));
    }
    
    setShowReceiptScanner(false);
    toast.success(`${itemsArray.length} item(s) imported from receipt!`);
  };

  // Check budget status and show appropriate notifications
  const checkBudgetLimits = async (
    categoryId,
    newExpenseAmount,
    existingAmount = 0
  ) => {
    try {
      // Use the API method to get category information
      const response = await categoryAPI.getCategory(categoryId);
      
      if (!response || !response.success || !response.data) {
        console.log("No budget set for this category");
        return true; // No budget restrictions if there's no budget
      }

      const { categoryAmount, targetAmount } = response.data;

      // For editing, we need to subtract the existing amount first
      const currentAmount =
        parseFloat(categoryAmount) - parseFloat(existingAmount);

      // Calculate what the new total would be
      const newTotal = currentAmount + parseFloat(newExpenseAmount);

      // Calculate percentage of budget that would be used
      const budgetPercentage = (newTotal / parseFloat(targetAmount)) * 100;

      if (budgetPercentage >= 100) {
        // Budget would be exceeded
        toast.error(
          `Warning: This expense will exceed your budget limit! 
         You'll be RM${(newTotal - targetAmount).toFixed(2)} over budget.`,
          { autoClose: false }
        );

        // Still allow the transaction to proceed
        return true;
      } else if (budgetPercentage >= 80) {
        // Budget is approaching the limit
        toast.warning(
          `You're approaching your budget limit! 
         This will bring you to ${budgetPercentage.toFixed(1)}% of your budget.`,
          { autoClose: 7000 }
        );

        return true;
      }

      // Budget is fine, proceed without warning
      return true;
    } catch (error) {
      console.error("Error checking budget limits:", error);
      return true; // On error, allow the transaction to proceed
    }
  };

  // If still checking income, show loading state
  if (isCheckingIncome) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>Add Expense</div>
          <div className={styles.loadingMessage}>Checking income information...</div>
        </div>
      </div>
    );
  }

  // If no income, show income requirement message
  if (incomeInfo && !incomeInfo.hasIncome) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>Income Required</div>
          <div className={styles.errorMessage}>
            You must add income for {incomeInfo.month}/{incomeInfo.year} before adding expenses.
          </div>
          <div className={styles.infoMessage}>
            Please go to the Income section and add your income first, then try adding expenses again.
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showReceiptScanner ? (
        <ReceiptScanner 
          onItemsSelected={handleReceiptProcessed}
          closeScanner={() => setShowReceiptScanner(false)}
          categoryId={categoryId}
        />
      ) : (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>Add Expense</div>
            <div className={styles.expensesContainer}>
              {expenseItems.map((item, index) => (
                <div key={item.tempId} className={styles.expenseItemRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(item.tempId, 'title', e.target.value)}
                      className={styles.input}
                      placeholder="Title"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <div className={styles.amountInputContainer}>
                      <span className={styles.currencyPrefix}>RM</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(item.tempId, 'amount', e.target.value)}
                        className={styles.amountInput}
                        placeholder="00.00"
                        min="0.01"
                        step="0.01"
                        max={expenseSummary ? expenseSummary.remainingIncome : undefined}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.actionButtons}>
                    {index === 0 && (
                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={addNewExpenseItem}
                        title="Add item"
                      >
                        +
                      </button>
                    )}
                    
                    {(expenseItems.length > 1) && (
                      <button
                        type="button"
                        className={styles.removeItemButton}
                        onClick={() => removeExpenseItem(item.tempId)}
                        title="Remove item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Warning if total would exceed available spending */}
            {projectedRemainingIncome !== null && projectedRemainingIncome < 0 && (
              <div className={styles.warningMessage}>
                ⚠ This expense would exceed your available income by RM {Math.abs(projectedRemainingIncome).toFixed(2)}
              </div>
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
                type="button" 
                className={styles.confirmButton}
                onClick={handleSubmit}
                disabled={!incomeInfo?.hasIncome}
              >
                Add
              </button>
            </div>
            
            <button
              type="button"
              className={styles.scanButton}
              onClick={() => setShowReceiptScanner(true)}
              disabled={!incomeInfo?.hasIncome}
            >
              Scan Receipt
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddExpenseModal;