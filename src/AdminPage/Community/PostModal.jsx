import React, { useState, useEffect } from "react";
import styles from "./PostModal.module.css";

// Function to clean HTML content for display while preserving HTML formatting
const cleanContentForDisplay = (htmlContent) => {
  if (!htmlContent) return "<p>No content available</p>";

  try {
    // Check if content is already escaped
    let workingContent = htmlContent;
    if (htmlContent.includes('&lt;') || htmlContent.includes('&gt;')) {
      workingContent = workingContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    // If there are no HTML tags in the content, wrap it in paragraph tags
    if (!workingContent.includes('<')) {
      return `<p>${workingContent}</p>`;
    }

    // Remove Figma metadata and other comments
    let cleaned = workingContent.replace(/<!--\(figmeta\).*?\/figmeta\)-->/gs, "");
    cleaned = cleaned.replace(/<!--\(figma\).*?\/figma\)-->/gs, "");
    cleaned = cleaned.replace(/<!--.*?-->/gs, "");

    // Remove span tags with data-metadata or data-buffer attributes
    cleaned = cleaned.replace(
      /<span\s+data-(metadata|buffer)="[^"]*"><\/span>/g,
      ""
    );

    // Remove style attributes
    cleaned = cleaned.replace(/\s+style="[^"]*"/g, "");

    // Replace spans with their content where useful
    cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/gs, "$1");
    
    return cleaned.trim() || "<p>No content available</p>";
  } catch (error) {
    console.error("Error cleaning content:", error);
    return "<p>Error displaying content</p>";
  }
};

function PostModal({ post, onClose, onReview, onViolated }) {
  const [fullPost, setFullPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:43210';

  // Fetch full post details when opening modal
  useEffect(() => {
    if (!post) return;
    
    const fetchFullPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/admin/community/posts/${post.postID}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch full post');
        }
        
        const data = await response.json();
        if (data.success) {
          setFullPost(data.data);
        }
      } catch (error) {
        console.error("Error fetching full post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFullPost();
  }, [post, apiUrl]);
  
  if (!post) return null;

  // Determine which post data to use (full or original)
  const postData = fullPost || post;
  
  // Format the creation date
  const createdDate = postData.createdAt 
    ? new Date(postData.createdAt).toLocaleString() 
    : "Unknown date";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Post Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.postMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Post ID:</span>
              <span className={styles.metaValue}>{postData.postID}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Author:</span>
              <span className={styles.metaValue}>{postData.username || "Unknown"}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Subject:</span>
              <span className={styles.metaValue}>{postData.subject || "No Subject"}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date:</span>
              <span className={styles.metaValue}>{createdDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status:</span>
              <span className={`${styles.statusBadge} ${styles[postData.status?.toLowerCase() || 'pending']}`}>
                {postData.status || "Pending"}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <p>Loading full content...</p>
            </div>
          ) : (
            <div className={styles.postContent}>
              <h3 className={styles.contentTitle}>Content</h3>
              <div 
                className={styles.contentText}
                dangerouslySetInnerHTML={{ __html: cleanContentForDisplay(postData.content) }}
              />
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.reviewButton} 
            onClick={onReview}
            disabled={postData.status === 'Reviewed' || isLoading}
          >
            Mark as Reviewed
          </button>
          <button 
            className={styles.violationButton} 
            onClick={onViolated}
            disabled={postData.status === 'Violated' || isLoading}
          >
            Mark as Violated
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostModal;