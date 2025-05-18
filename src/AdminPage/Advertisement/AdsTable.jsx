import React, { useState } from "react";
import styles from "./AdsPage.module.css";
import { getImageUrl, formatDate, truncateText } from "../utils";

// Base64 encoded placeholder image with improved design
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23f3f4f6'/%3E%3Crect x='2' y='2' width='76' height='56' fill='%23f9fafb' rx='3' ry='3' stroke='%23e5e7eb' stroke-width='1'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='9' text-anchor='middle' dominant-baseline='middle' fill='%23a1a1aa'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdvertisementTable = ({ advertisements, onEdit, onDelete, loading }) => {
  // Track image loading state
  const [imageStates, setImageStates] = useState({});

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading advertisements...</p>
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>📝</div>
        <h3>No Advertisements Found</h3>
        <p>Click "Add New Advertisement" to create one.</p>
      </div>
    );
  }

  // Helper to get the display image URL
  const getDisplayImage = (ad) => {
    if (!ad.imageURL) return PLACEHOLDER_IMAGE;
    
    // If we have a loading state for this image
    if (imageStates[ad.adID] === 'error') {
      return PLACEHOLDER_IMAGE;
    }
    
    return getImageUrl(ad.imageURL);
  };

  // Handle image load success
  const handleImageLoad = (adId) => {
    setImageStates(prev => ({
      ...prev,
      [adId]: 'loaded'
    }));
  };

  // Handle image load error
  const handleImageError = (adId) => {
    setImageStates(prev => ({
      ...prev,
      [adId]: 'error'
    }));
  };

  // Helper for status style class
  const getStatusClass = (isActive) => {
    return isActive ? styles.statusActive : styles.statusInactive;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.imageCell}>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Position</th>
            <th>Duration</th>
            <th>Status</th>
            <th className={styles.actionCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {advertisements.map((ad, index) => (
            <tr 
              key={ad.adID} 
              className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
            >
              <td className={styles.imageCell}>
                <div className={styles.imageThumbnailContainer}>
                  <img
                    src={getDisplayImage(ad)}
                    alt={ad.title || "Advertisement"}
                    className={styles.thumbnailImage}
                    onLoad={() => handleImageLoad(ad.adID)}
                    onError={() => handleImageError(ad.adID)}
                  />
                </div>
              </td>
              <td className={styles.titleCell}>{truncateText(ad.title, 30)}</td>
              <td className={styles.descriptionCell}>{truncateText(ad.description, 50)}</td>
              <td>
                <span className={styles.positionBadge}>
                  {ad.position || "Banner"}
                </span>
              </td>
              <td className={styles.durationCell}>
                <div className={styles.dateRange}>
                  <div className={styles.startDate}>{formatDate(ad.startDate)}</div>
                  <div className={styles.dateSeparator}>to</div>
                  <div className={styles.endDate}>{formatDate(ad.endDate)}</div>
                </div>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(ad.isActive)}`}>
                  {ad.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={styles.actionCell}>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => onEdit(ad)}
                    className={styles.editButton}
                    aria-label={`Edit ${ad.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(ad.adID)}
                    className={styles.deleteButton}
                    aria-label={`Delete ${ad.title}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdvertisementTable;