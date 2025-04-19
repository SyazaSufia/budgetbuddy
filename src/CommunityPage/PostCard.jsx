import React from "react";
import styles from "./PostCard.module.css";
import { formatDistanceToNow } from 'date-fns'; // For formatting dates

// Update PostCard to handle both direct props and post object
function PostCard({ post, title, description, commentCount, date }) {
  // If post object is provided, use its data, otherwise use direct props
  const usePost = post !== undefined;
  
  // Extract data from post object or use direct props
  const postTitle = usePost ? post.subject : title;
  const postCommentCount = usePost ? (post.commentCount || 0) : commentCount;
  const username = usePost ? post.username : null;
  
  // Format date
  let formattedDate;
  if (usePost) {
    // Format date from post object using date-fns
    formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  } else {
    // Use the date prop directly
    formattedDate = date;
  }
  
  // Create a plain text excerpt from HTML content
  const createExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Create a temporary element to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Return a shortened version of the text
    return textContent.length > 150 ? textContent.substring(0, 147) + '...' : textContent;
  };

  // Get description
  const postDescription = usePost ? createExcerpt(post.content) : description;

  return (
    <article className={styles.postCard}>
      <div className={styles.postContent}>
        <div className={styles.iconContainer}>
          <img src="/chat-icon.svg" alt="Chat" width="40" height="25" />
        </div>
        <div className={styles.postBody}>
          <div className={styles.textContent}>
            <h2 className={styles.postTitle}>{postTitle}</h2>
            {username && <p className={styles.postAuthor}>Posted by: {username}</p>}
            <p className={styles.postDescription}>{postDescription}</p>
          </div>
          <div className={styles.postMeta}>
            <div className={styles.commentCount}>
              <img src="/chatGrey.svg" alt="Comments" width="20" height="15" />
              <span className={styles.metaText}>{postCommentCount}</span>
            </div>
            <div className={styles.postDate}>
              <img src="/calendarGrey.svg" alt="Date" width="14" height="14" />
              <span className={styles.metaText}>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PostCard;