import React, { useState, useEffect } from "react";
import styles from "./AdsPage.module.css";
import { getImageUrl } from "../utils";

// Base64 encoded gray placeholder image
const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAD6CAYAAAAbbXrzAAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4QMcCjcV7PAZnwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAFjSURBVHja7cExAQAAAMKg9U9tDQ+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBPAAB42ImzQAAAABJRU5ErkJggg==";

const AdvertisementForm = ({ advertisement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkURL: "",
    startDate: "",
    endDate: "",
    position: "banner", // Default to banner
    isActive: true,
    image: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Initialize form with advertisement data if editing
  useEffect(() => {
    if (advertisement) {
      // Format dates for form inputs
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        title: advertisement.title || "",
        description: advertisement.description || "",
        linkURL: advertisement.linkURL || "",
        startDate: formatDate(advertisement.startDate),
        endDate: formatDate(advertisement.endDate),
        position: "banner", // Always set to banner
        isActive: advertisement.isActive !== undefined ? advertisement.isActive : true,
        image: null // We don't populate the file input
      });
      
      // Set image preview if available
      if (advertisement.imageURL) {
        setPreviewImage(getImageUrl(advertisement.imageURL));
      }
    }
  }, [advertisement]);
  
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      // Handle file upload
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create preview for the selected image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    // Only require image for new advertisements
    if (!advertisement && !formData.image) {
      newErrors.image = "Please upload an image";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create FormData object for multipart/form-data submission
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("linkURL", formData.linkURL);
    submitData.append("startDate", formData.startDate);
    submitData.append("endDate", formData.endDate);
    submitData.append("position", "banner"); // Always set to banner
    submitData.append("isActive", formData.isActive);
    
    if (formData.image) {
      submitData.append("image", formData.image);
    }
    
    onSubmit(submitData);
  };
  
  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>
        {advertisement ? "Edit Advertisement" : "Add New Advertisement"}
      </h2>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            placeholder="Enter advertisement title"
          />
          {errors.title && <p className={styles.errorText}>{errors.title}</p>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="linkURL" className={styles.label}>
            Link URL
          </label>
          <input
            type="url"
            id="linkURL"
            name="linkURL"
            value={formData.linkURL}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://example.com"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="startDate" className={styles.label}>
            Start Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.startDate ? styles.inputError : ""}`}
          />
          {errors.startDate && <p className={styles.errorText}>{errors.startDate}</p>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="endDate" className={styles.label}>
            End Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.endDate ? styles.inputError : ""}`}
          />
          {errors.endDate && <p className={styles.errorText}>{errors.endDate}</p>}
        </div>
        
        {/* Position selection has been removed */}
        
        <div className={styles.formGroup}>
          <label className={`${styles.label} ${styles.checkboxLabel}`}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Active Advertisement
          </label>
        </div>
      </div>
      
      <div className={styles.formGroupFull}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Enter advertisement description"
          rows={4}
        ></textarea>
      </div>
      
      <div className={styles.formGroupFull}>
        <label htmlFor="image" className={styles.label}>
          Advertisement Image {!advertisement && <span className={styles.required}>*</span>}
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className={`${styles.fileInput} ${errors.image ? styles.inputError : ""}`}
        />
        {errors.image && <p className={styles.errorText}>{errors.image}</p>}
        
        {previewImage && (
          <div className={styles.imagePreviewContainer}>
            <img 
              src={previewImage} 
              alt="Ad preview" 
              className={styles.imagePreview}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
        )}
        
        {advertisement && !formData.image && (
          <p className={styles.imageNote}>
            Leave empty to keep the current image
          </p>
        )}
      </div>
      
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {advertisement ? "Update Advertisement" : "Create Advertisement"}
        </button>
      </div>
    </form>
  );
};

export default AdvertisementForm;