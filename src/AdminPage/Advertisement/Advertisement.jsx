import React, { useState, useEffect } from "react";
import "./Advertisement.css";
import { getImageUrl, getPlaceholderImage, getErrorPlaceholder } from "../utils/imageUtils";
import { adminAPI } from "../../services/AdminApi";

/**
 * Component to display advertisements in admin panel
 * @param {Object} props Component props
 * @param {number} props.limit - Maximum number of ads to display
 * @param {boolean} props.showPlaceholder - Whether to show a placeholder when no ads are available
 * @param {string} props.status - Filter ads by status ('active', 'inactive', 'all')
 * @returns {JSX.Element} Advertisement component
 */
const Advertisement = ({ 
  limit = 1,
  showPlaceholder = true,
  status = "all"
}) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track image loading state
  const [imageStates, setImageStates] = useState({});

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        
        // Use the admin API to fetch advertisements
        const response = await adminAPI.advertisements.getAllAdvertisements(1, limit, status);
        
        // Filter for active ads if needed (depending on your backend implementation)
        let adsData = response.data || response.advertisements || [];
        
        // If you want only active ads for public display, filter them
        if (status === 'active') {
          adsData = adsData.filter(ad => ad.status === 'active' || ad.isActive === true || ad.isActive === 1);
        }
        
        setAdvertisements(adsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching advertisements:", err);
        setError(err.message || "Failed to load advertisements");
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [limit, status]);

  // Generate a placeholder advertisement
  const getPlaceholderAd = () => {
    return {
      adID: 'placeholder',
      id: 'placeholder',
      title: 'Banner Ad Space',
      description: 'This space is available for advertising',
      imageURL: null,
      image: null,
      linkURL: '#',
      link: '#',
    };
  };

  // Helper to get the display image URL
  const getDisplayImage = (ad) => {
    const imageUrl = ad.imageURL || ad.image;
    const adId = ad.adID || ad.id;
    
    // If no image URL, return placeholder
    if (!imageUrl) {
      return getPlaceholderImage();
    }
    
    // If we have a loading state for this image and it's an error
    if (imageStates[adId] === 'error') {
      return getErrorPlaceholder();
    }
    
    // Use the centralized utility to get the proper URL
    return getImageUrl(imageUrl);
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

  // Handle ad click tracking (optional)
  const handleAdClick = async (ad) => {
    const adId = ad.adID || ad.id;
    try {
      // You could implement click tracking here if your API supports it
      // await adminAPI.advertisements.trackClick(adId);
      console.log(`Ad clicked: ${adId}`);
    } catch (err) {
      console.error("Error tracking ad click:", err);
    }
  };

  // Handle ad refresh
  const handleRefresh = async () => {
    setImageStates({}); // Reset image states
    setLoading(true);
    
    try {
      const response = await adminAPI.advertisements.getAllAdvertisements(1, limit, status);
      let adsData = response.data || response.advertisements || [];
      
      if (status === 'active') {
        adsData = adsData.filter(ad => ad.status === 'active' || ad.isActive === true || ad.isActive === 1);
      }
      
      setAdvertisements(adsData);
      setError(null);
    } catch (err) {
      console.error("Error refreshing advertisements:", err);
      setError(err.message || "Failed to refresh advertisements");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="ad-container ad-banner ad-loading">Loading ads...</div>;
  }

  // If there are no ads and we don't want placeholders, return null
  if ((error || advertisements.length === 0) && !showPlaceholder) {
    return null;
  }

  // Use real ads or placeholder if needed
  const adsToDisplay = advertisements.length > 0 
    ? advertisements 
    : (showPlaceholder ? [getPlaceholderAd()] : []);

  const renderAdContent = (ad) => {
    const adId = ad.adID || ad.id;
    const linkUrl = ad.linkURL || ad.link;
    const isPlaceholder = adId === 'placeholder';
    
    const adContent = (
      <div className={`ad-content ${isPlaceholder ? 'ad-placeholder' : ''}`}>
        <div className="ad-image-container">
          <img 
            src={isPlaceholder ? getPlaceholderImage() : getDisplayImage(ad)}
            alt={ad.title || "Advertisement"} 
            className="ad-image"
            onLoad={() => !isPlaceholder && handleImageLoad(adId)}
            onError={() => !isPlaceholder && handleImageError(adId)}
          />
          
          {/* Image loading state indicator */}
          {!isPlaceholder && imageStates[adId] === 'error' && (
            <div className="ad-image-error">
              <button 
                onClick={() => {
                  setImageStates(prev => ({ ...prev, [adId]: undefined }));
                  // Force image reload by updating the src
                  const img = document.querySelector(`img[alt="${ad.title || "Advertisement"}"]`);
                  if (img) {
                    const src = img.src;
                    img.src = '';
                    img.src = src;
                  }
                }}
                className="retry-button"
                title="Retry loading image"
              >
                🔄 Retry
              </button>
            </div>
          )}
        </div>
        
        <div className="ad-text">
          <h4 className="ad-title">{ad.title}</h4>
          {ad.description && (
            <p className="ad-description">{ad.description}</p>
          )}
          
          {/* Admin-specific information */}
          <div className="ad-admin-info">
            <small className="ad-status">
              Status: {ad.isActive === 1 || ad.isActive === true ? 'Active' : 'Inactive'}
            </small>
            {ad.startDate && (
              <small className="ad-date">
                Start: {new Date(ad.startDate).toLocaleDateString()}
              </small>
            )}
            {ad.endDate && (
              <small className="ad-date">
                End: {new Date(ad.endDate).toLocaleDateString()}
              </small>
            )}
          </div>
        </div>
      </div>
    );
    
    // Only wrap in anchor if it's not a placeholder and has a valid link
    return isPlaceholder || !linkUrl || linkUrl === '#' ? (
      adContent
    ) : (
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="ad-link"
        title={ad.title}
        onClick={() => handleAdClick(ad)}
      >
        {adContent}
      </a>
    );
  };

  // Show error state if there's an error and no ads to show
  if (error && advertisements.length === 0 && !showPlaceholder) {
    return (
      <div className="ad-container ad-banner ad-error">
        <div className="ad-error-message">
          <small>Unable to load advertisements</small>
          <button onClick={handleRefresh} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Always render as banner
  return (
    <div className="ad-container ad-banner">
      {/* Admin controls */}
      <div className="ad-admin-controls">
        <button onClick={handleRefresh} className="refresh-button" title="Refresh advertisements">
          🔄 Refresh
        </button>
        <span className="ad-count">
          Showing {adsToDisplay.length} of {advertisements.length || 0} ads
        </span>
      </div>
      
      {adsToDisplay.map((ad, index) => {
        const adId = ad.adID || ad.id || index;
        return (
          <div key={adId} className="ad-item">
            {renderAdContent(ad)}
            <small className="ad-label">Advertisement</small>
          </div>
        );
      })}
      
      {/* Show error message if there's an error but we're still showing content */}
      {error && advertisements.length > 0 && (
        <div className="ad-error-notice">
          <small>⚠️ {error}</small>
        </div>
      )}
    </div>
  );
};

export default Advertisement;