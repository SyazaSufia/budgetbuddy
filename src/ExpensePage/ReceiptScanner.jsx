import React, { useState } from "react";
import styles from "./AddModal.module.css";
import { toast } from "react-toastify";
import { expenseAPI } from "../services/UserApi"; // Update this import path to match your project structure

const ReceiptScanner = ({
  onItemsSelected,
  closeScanner,
  categoryId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [extractedItems, setExtractedItems] = useState([]);
  const [isItemsExtracted, setIsItemsExtracted] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setReceiptImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsItemsExtracted(false); // Reset when a new image is uploaded
      setExtractedItems([]);
      setError(null);
    }
  };

  const processReceipt = async () => {
    if (!receiptImage) {
      toast.error("Please upload a receipt image first");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Create FormData to send the image file
      const formData = new FormData();
      formData.append('receipt', receiptImage);
      
      // Only append categoryID if it's not null or undefined
      if (categoryId) {
        formData.append('categoryID', categoryId.toString());
      }
      
      // Use the API method from the centralized API configuration
      const result = await expenseAPI.processReceipt(formData);
      
      if (result.success) {
        // Convert single item to array format if needed
        const receiptItems = result.data.items || [{ 
          title: result.data.title || "Unnamed Item",
          amount: result.data.amount || 0,
          date: result.data.date || new Date().toISOString().split('T')[0]
        }];
        
        // Add temp IDs for UI management
        const itemsWithId = receiptItems.map((item, index) => ({
          ...item,
          tempId: `temp-${Date.now()}-${index}`,
          isSelected: true // Default selected
        }));
        
        setExtractedItems(itemsWithId);
        setIsItemsExtracted(true);
        toast.success("Receipt processed successfully!");
      } else {
        setError(result.message || "Failed to extract information from receipt");
        toast.error(result.message || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      setError(error.message || "Error processing receipt");
      toast.error(error.message || "Error processing receipt");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItemSelection = (tempId) => {
    setExtractedItems(prevItems => 
      prevItems.map(item => 
        item.tempId === tempId 
          ? { ...item, isSelected: !item.isSelected } 
          : item
      )
    );
  };

  const addSelectedItems = () => {
    const selectedItems = extractedItems.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    onItemsSelected(selectedItems);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${isItemsExtracted ? styles.modalContentWide : ''}`}>
        <div className={styles.modalHeader}>Upload Receipt</div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {!isItemsExtracted ? (
          <>
            <div className={styles.uploadSection}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isProcessing}
                className={styles.fileInput}
              />
              
              {previewUrl && (
                <div className={styles.previewContainer}>
                  <img 
                    src={previewUrl} 
                    alt="Receipt preview" 
                    className={styles.receiptPreview}
                  />
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeScanner}
                disabled={isProcessing}
              >
                Cancel
              </button>
              
              <button
                type="button"
                className={styles.confirmButton}
                onClick={processReceipt}
                disabled={!receiptImage || isProcessing}
              >
                {isProcessing ? "Processing..." : "Scan Receipt"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Extracted Items Review UI */}
            <div className={styles.extractedItemsContainer}>
              <h3 className={styles.sectionTitle}>Extracted Items</h3>
              {extractedItems.length === 0 ? (
                <p className={styles.noItemsMessage}>No items were extracted from the receipt.</p>
              ) : (
                <>
                  <div className={styles.itemsListHeader}>
                    <span className={styles.itemTitle}>Select Item</span>
                    <span className={styles.itemAmount}>Amount</span>
                  </div>
                  <div className={styles.itemsList}>
                    {extractedItems.map((item) => (
                      <div 
                        key={item.tempId} 
                        className={`${styles.itemRow} ${!item.isSelected ? styles.itemRowDeselected : ''}`}
                      >
                        <div className={styles.itemCheckbox}>
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() => toggleItemSelection(item.tempId)}
                          />
                        </div>
                        <div className={styles.itemTitle}>{item.title}</div>
                        <div className={styles.itemAmount}>
                          RM {parseFloat(item.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setIsItemsExtracted(false);
                }}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeScanner}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={addSelectedItems}
                disabled={extractedItems.filter(i => i.isSelected).length === 0}
              >
                Add Selected Items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;