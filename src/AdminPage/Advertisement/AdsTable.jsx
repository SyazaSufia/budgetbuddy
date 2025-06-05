import React, { useState, useCallback, useRef } from "react";
import styles from "./AdsPage.module.css";
import { formatDate, truncateText } from "../../utils/ImageUtils";
import { getImageUrl } from "../../utils/ImageUtils";

// Small placeholder for table thumbnails
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23f3f4f6'/%3E%3Crect x='2' y='2' width='76' height='56' fill='%23f9fafb' rx='3' ry='3' stroke='%23e5e7eb' stroke-width='1'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='9' text-anchor='middle' dominant-baseline='middle' fill='%23a1a1aa'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdvertisementTable = ({ 
  advertisements, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading 
}) => {
  // Track which images have failed - once failed, don't retry
  const [failedImages, setFailedImages] = useState(new Set());
  // Use ref to track which images are currently loading to prevent duplicate events
  const loadingImages = useRef(new Set());

  // Handle image load error - only set failed state once
  const handleImageError = useCallback((adId) => {
    if (!failedImages.has(adId) && !loadingImages.current.has(adId)) {
      console.warn(`Failed to load image for ad ID: ${adId}`);
      setFailedImages(prev => new Set([...prev, adId]));
      loadingImages.current.delete(adId);
    }
  }, [failedImages]);

  // Handle image load success
  const handleImageLoad = useCallback((adId) => {
    if (!loadingImages.current.has(adId)) {
      console.log(`Image loaded successfully for ad ${adId}`);
      loadingImages.current.delete(adId);
      // Remove from failed images if it was there (shouldn't happen, but just in case)
      setFailedImages(prev => {
        if (prev.has(adId)) {
          const newSet = new Set(prev);
          newSet.delete(adId);
          return newSet;
        }
        return prev;
      });
    }
  }, []);

  // Helper function to get the correct image URL
  const getImageSrc = (ad) => {
    // If no image URL or image has failed, use placeholder
    if (!ad.imageURL || failedImages.has(ad.adID)) {
      return PLACEHOLDER_IMAGE;
    }
    
    // Mark as loading when we first try to load it
    if (!loadingImages.current.has(ad.adID)) {
      loadingImages.current.add(ad.adID);
    }

    // Use getImageUrl to properly format the URL
    return getImageUrl(ad.imageURL);
  };

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

  // Helper for status style class
  const getStatusClass = (isActive) => {
    return isActive ? styles.statusActive : styles.statusInactive;
  };

  // Helper to check if ad is expired
  const isAdExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  // Helper to get status display text
  const getStatusText = (isActive, endDate) => {
    if (isAdExpired(endDate)) {
      return "Expired";
    }
    return isActive ? "Active" : "Inactive";
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
          {advertisements.map((ad, index) => {
            const isExpired = isAdExpired(ad.endDate);
            const imageHasFailed = failedImages.has(ad.adID);
            const imageSrc = getImageSrc(ad);
            
            return (
              <tr 
                key={ad.adID} 
                className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${isExpired ? styles.expiredRow : ''}`}
              >
                <td className={styles.imageCell}>
                  <div className={styles.imageThumbnailContainer}>
                    <img
                      src={imageSrc}
                      alt={ad.title || "Advertisement"}
                      className={styles.thumbnailImage}
                      onLoad={() => handleImageLoad(ad.adID)}
                      onError={() => handleImageError(ad.adID)}
                      // Use a stable key that includes the current src to prevent unnecessary reloads
                      key={`${ad.adID}-${imageHasFailed ? 'placeholder' : 'image'}`}
                    />
                    {imageHasFailed && (
                      <div className={styles.imageErrorIndicator} title="Image failed to load">
                        ⚠️
                      </div>
                    )}
                  </div>
                </td>
                <td className={styles.titleCell}>
                  <div className={styles.titleContainer}>
                    <span className={styles.titleText}>
                      {truncateText(ad.title, 30)}
                    </span>
                    {ad.linkURL && (
                      <a 
                        href={ad.linkURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.linkIcon}
                        title="Visit link"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                </td>
                <td className={styles.descriptionCell}>
                  <span title={ad.description || 'No description'}>
                    {truncateText(ad.description, 50)}
                  </span>
                </td>
                <td>
                  <span className={styles.positionBadge}>
                    {ad.position || "Banner"}
                  </span>
                </td>
                <td className={styles.durationCell}>
                  <div className={styles.dateRange}>
                    <div className={styles.startDate}>
                      {formatDate(ad.startDate)}
                    </div>
                    <div className={styles.dateSeparator}>to</div>
                    <div className={`${styles.endDate} ${isExpired ? styles.expiredDate : ''}`}>
                      {formatDate(ad.endDate)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(ad.isActive && !isExpired)}`}>
                    {getStatusText(ad.isActive, ad.endDate)}
                  </span>
                </td>
                <td className={styles.actionCell}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => onEdit(ad)}
                      className={styles.editButton}
                      aria-label={`Edit ${ad.title}`}
                      title="Edit advertisement"
                    >
                      Edit
                    </button>  
                    
                    <button
                      onClick={() => onDelete(ad.adID)}
                      className={styles.deleteButton}
                      aria-label={`Delete ${ad.title}`}
                      title="Delete advertisement"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdvertisementTable;