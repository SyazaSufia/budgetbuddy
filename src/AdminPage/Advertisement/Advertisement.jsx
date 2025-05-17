import React, { useState, useEffect } from "react";
import "./Advertisement.css";
import { getImageUrl, getApiBaseUrl } from "../utils";

// Base64 encoded solid gray placeholder image with text
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3ELoading...%3C/text%3E%3C/svg%3E";

/**
 * Component to display advertisements
 * @param {Object} props Component props
 * @param {number} props.limit - Maximum number of ads to display
 * @param {boolean} props.showPlaceholder - Whether to show a placeholder when no ads are available
 * @returns {JSX.Element} Advertisement component
 */
const Advertisement = ({ 
  limit = 1,
  showPlaceholder = true
}) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track image loading state
  const [imageStates, setImageStates] = useState({});

  // Get the API base URL from utility function
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `${apiBaseUrl}/advertisement/active?limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch advertisements: ${response.status}`);
        }

        const data = await response.json();
        setAdvertisements(data.data || []);
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
  }, [apiBaseUrl, limit]);

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
    const isPlaceholder = ad.adID === 'placeholder';
    
    const adContent = (
      <div className={`ad-content ${isPlaceholder ? 'ad-placeholder' : ''}`}>
        <img 
          src={isPlaceholder ? PLACEHOLDER_IMAGE : getDisplayImage(ad)}
          alt={ad.title || "Advertisement"} 
          className="ad-image"
          onLoad={() => !isPlaceholder && handleImageLoad(ad.adID)}
          onError={() => !isPlaceholder && handleImageError(ad.adID)}
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
    return isPlaceholder || !ad.linkURL ? (
      adContent
    ) : (
      <a 
        href={ad.linkURL} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="ad-link"
        title={ad.title}
      >
        {adContent}
      </a>
    );
  };

  // Always render as banner
  return (
    <div className="ad-container ad-banner">
      {adsToDisplay.map((ad, index) => (
        <div key={ad.adID || index} className="ad-item">
          {renderAdContent(ad)}
          <small className="ad-label">Advertisement</small>
        </div>
      ))}
    </div>
  );
};

export default Advertisement;