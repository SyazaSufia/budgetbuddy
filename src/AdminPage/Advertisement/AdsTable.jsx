import React, { useState } from "react";
import styles from "./AdsPage.module.css";
import { getImageUrl, formatDate, truncateText } from "../utils";

// Base64 encoded solid gray placeholder image with text
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='8' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdvertisementTable = ({ advertisements, onEdit, onDelete, loading }) => {
  // Track image loading state
  const [imageStates, setImageStates] = useState({});

  if (loading) {
    return <div className={styles.loading}>Loading advertisements...</div>;
  }

  if (advertisements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No advertisements found. Click "Add New Advertisement" to create one.</p>
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
          {advertisements.map((ad) => (
            <tr key={ad.adID}>
              <td className={styles.imageCell}>
                <img
                  src={getDisplayImage(ad)}
                  alt={ad.title || "Advertisement"}
                  className={styles.thumbnailImage}
                  onLoad={() => handleImageLoad(ad.adID)}
                  onError={() => handleImageError(ad.adID)}
                />
              </td>
              <td>{truncateText(ad.title, 30)}</td>
              <td>{truncateText(ad.description, 50)}</td>
              <td>{ad.position || "Banner"}</td>
              <td>
                {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
              </td>
              <td>
                <span className={`${styles.status} ${ad.isActive ? styles.active : styles.inactive}`}>
                  {ad.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={styles.actionCell}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdvertisementTable;