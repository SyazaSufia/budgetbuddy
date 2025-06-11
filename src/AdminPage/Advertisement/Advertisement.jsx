import React, { useState, useEffect } from "react";
import "./Advertisement.css";
import { getImageUrl } from "../utils";
import { adminAPI } from "../../services/AdminApi";

// Base64 encoded solid gray placeholder image with text
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3ELoading...%3C/text%3E%3C/svg%3E";

/**
 * Component to display advertisements
 * @param {Object} props Component props
 * @param {number} props.limit - Maximum number of ads to display
 * @param {boolean} props.showPlaceholder - Whether to show a placeholder when no ads are available
 * @param {string} props.status - Filter ads by status ('active', 'inactive', 'all')
 * @returns {JSX.Element} Advertisement component
 */
const Advertisement = ({ 
  limit = 1,
  showPlaceholder = true,
  status = "all" // Default to all ads, but you might want 'active' for public display
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
          adsData = adsData.filter(ad => ad.status === 'active' || ad.isActive === true);
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
      id: 'placeholder', // Some APIs might use 'id' instead of 'adID'
      title: 'Banner Ad Space',
      description: 'This space is available for advertising',
      imageURL: null,
      image: null, // Some APIs might use 'image' instead of 'imageURL'
      linkURL: '#',
      link: '#', // Some APIs might use 'link' instead of 'linkURL'
    };
  };

  // Helper to get the display image URL
  const getDisplayImage = (ad) => {
    const imageUrl = ad.imageURL || ad.image;
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    
    const adId = ad.adID || ad.id;
    // If we have a loading state for this image
    if (imageStates[adId] === 'error') {
      return PLACEHOLDER_IMAGE;
    }
    
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
        <img 
          src={isPlaceholder ? PLACEHOLDER_IMAGE : getDisplayImage(ad)}
          alt={ad.title || "Advertisement"} 
          className="ad-image"
          onLoad={() => !isPlaceholder && handleImageLoad(adId)}
          onError={() => !isPlaceholder && handleImageError(adId)}
        />
        
        <div className="ad-text">
          <h4 className="ad-title">{ad.title}</h4>
          {ad.description && (
            <p className="ad-description">{ad.description}</p>
          )}
        </div>
      </div>
    );
    
    // Only wrap in anchor if it's not a placeholder or has a valid link
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
        </div>
      </div>
    );
  }

  // Always render as banner
  return (
    <div className="ad-container ad-banner">
      {adsToDisplay.map((ad, index) => {
        const adId = ad.adID || ad.id || index;
        return (
          <div key={adId} className="ad-item">
            {renderAdContent(ad)}
            <small className="ad-label">Advertisement</small>
          </div>
        );
      })}
    </div>
  );
};

export default Advertisement;