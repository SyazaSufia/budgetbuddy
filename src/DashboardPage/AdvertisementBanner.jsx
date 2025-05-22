import React, { useState, useEffect, useRef } from 'react';
import { advertisementAPI } from '../services/api';
import styles from './AdvertisementBanner.module.css';

// Base64 encoded placeholder image
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='100' viewBox='0 0 300 100'%3E%3Crect width='300' height='100' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3EAdvertisement%3C/text%3E%3C/svg%3E";

// Get base API URL for image URLs
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:43210';
  }
  return 'http://145.79.12.85:43210';
};

const AdvertisementBanner = ({ limit = 3, showPlaceholder = true }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageStates, setImageStates] = useState({});
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);

  const apiBaseUrl = getApiBaseUrl();

  // Fetch advertisements using the centralized API
  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await advertisementAPI.getActiveAds(limit);
      
      if (result.data && result.data.length > 0) {
        setAdvertisements(result.data);
      } else {
        setAdvertisements([]);
      }
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAdvertisements();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [limit]);

  // Set up auto-scroll timer when advertisements are loaded
  useEffect(() => {
    if (advertisements.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [advertisements.length]);

  // Pause auto-scroll when modal is open
  useEffect(() => {
    if (showModal && intervalRef.current) {
      clearInterval(intervalRef.current);
    } else if (!showModal && advertisements.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showModal, advertisements.length]);

  // Navigate to previous ad
  const goToPrevAd = (e) => {
    if (e) e.stopPropagation();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentAdIndex(prevIndex => {
      const newIndex = prevIndex - 1;
      return newIndex < 0 ? advertisements.length - 1 : newIndex;
    });
    
    if (!showModal && advertisements.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
      }, 5000);
    }
  };

  // Navigate to next ad
  const goToNextAd = (e) => {
    if (e) e.stopPropagation();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
    
    if (!showModal && advertisements.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
      }, 5000);
    }
  };

  // Handle manual navigation with dots
  const goToAd = (index) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentAdIndex(index);
    
    if (!showModal && advertisements.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % advertisements.length);
      }, 5000);
    }
  };

  // Generate a placeholder advertisement
  const getPlaceholderAd = () => {
    return {
      adID: 'placeholder',
      title: 'Banner Ad Space',
      description: 'This space is available for advertising',
      imageURL: null,
      linkURL: '#',
    };
  };

  // Helper to get the display image URL
  const getDisplayImage = (ad) => {
    if (!ad.imageURL) return PLACEHOLDER_IMAGE;
    
    if (imageStates[ad.adID] === 'error') {
      return PLACEHOLDER_IMAGE;
    }
    
    if (ad.imageURL.startsWith('http')) {
      return ad.imageURL;
    }
    
    return `${apiBaseUrl}${ad.imageURL}`;
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
    console.warn(`Failed to load image for ad ID: ${adId}`);
    setImageStates(prev => ({
      ...prev,
      [adId]: 'error'
    }));
  };

  // Open modal to show full ad
  const openAdModal = () => {
    setShowModal(true);
  };

  // Close modal
  const closeModal = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowModal(false);
  };

  // Show ad counter (e.g., "2 of 5")
  const getAdCounter = () => {
    return `${currentAdIndex + 1} of ${adsToDisplay.length}`;
  };

  // If loading, show loading state
  if (isLoading) {
    return <div className={styles.adBanner}>Loading advertisements...</div>;
  }

  // If there's an error or no ads and we don't want placeholders, hide the component
  if ((error || advertisements.length === 0) && !showPlaceholder) {
    return null;
  }

  // Use real ads or placeholder if needed
  const adsToDisplay = advertisements.length > 0 
    ? advertisements 
    : (showPlaceholder ? [getPlaceholderAd()] : []);
  
  // If we still have no ads to display, return null
  if (adsToDisplay.length === 0) {
    return null;
  }

  const currentAd = adsToDisplay[currentAdIndex];
  const isPlaceholder = currentAd.adID === 'placeholder';

  const renderAdContent = () => (
    <div className={`${styles.adContent} ${isPlaceholder ? styles.adPlaceholder : ''}`}>
      <img 
        src={getDisplayImage(currentAd)} 
        alt={currentAd.title || "Advertisement"} 
        className={styles.adImage}
        onLoad={() => !isPlaceholder && handleImageLoad(currentAd.adID)}
        onError={() => !isPlaceholder && handleImageError(currentAd.adID)}
      />
      <div className={styles.adTextOverlay}>
        <h3 className={styles.adTitle}>{currentAd.title}</h3>
        {currentAd.description && (
          <p className={styles.adDescription}>{currentAd.description}</p>
        )}
      </div>
      <small className={styles.adLabel}>Advertisement</small>
    </div>
  );

  return (
    <>
      <div className={styles.adBannerContainer} onClick={openAdModal}>
        {renderAdContent()}
        
        {/* Navigation arrows for multiple ads */}
        {adsToDisplay.length > 1 && (
          <>
            <button 
              className={`${styles.navArrow} ${styles.leftArrow}`}
              onClick={goToPrevAd}
              aria-label="Previous advertisement"
            >
              &#10094;
            </button>
            <button 
              className={`${styles.navArrow} ${styles.rightArrow}`}
              onClick={goToNextAd}
              aria-label="Next advertisement"
            >
              &#10095;
            </button>
          </>
        )}
        
        {/* Navigation dots for multiple ads */}
        {adsToDisplay.length > 1 && (
          <div className={styles.adNavigation}>
            {adsToDisplay.map((_, index) => (
              <button
                key={index}
                className={`${styles.adDot} ${index === currentAdIndex ? styles.activeDot : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToAd(index);
                }}
                aria-label={`Advertisement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing full advertisement */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            
            {/* Modal Navigation Arrows */}
            {adsToDisplay.length > 1 && (
              <>
                <button 
                  className={`${styles.modalNavArrow} ${styles.modalLeftArrow}`}
                  onClick={goToPrevAd}
                  aria-label="Previous advertisement"
                >
                  &#10094;
                </button>
                <button 
                  className={`${styles.modalNavArrow} ${styles.modalRightArrow}`}
                  onClick={goToNextAd}
                  aria-label="Next advertisement"
                >
                  &#10095;
                </button>
              </>
            )}
            
            <div className={styles.modalImageContainer}>
              <img 
                src={getDisplayImage(currentAd)} 
                alt={currentAd.title || "Advertisement"} 
                className={styles.modalImage}
              />
              
              {/* Counter for modal */}
              {adsToDisplay.length > 1 && (
                <div className={styles.adCounter}>
                  {getAdCounter()}
                </div>
              )}
            </div>
            
            <div className={styles.modalInfo}>
              <h2>{currentAd.title}</h2>
              {currentAd.description && <p>{currentAd.description}</p>}
              
              {currentAd.linkURL && !isPlaceholder && (
                <a 
                  href={currentAd.linkURL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.visitLinkButton}
                >
                  Visit Link
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvertisementBanner;