const db = require("../db");
// You may need to install these packages: npm install dompurify jsdom
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Enhanced function to clean HTML content
const cleanContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  // 1. Remove Figma metadata and other comments
  let cleaned = htmlContent.replace(/<!--\(figmeta\).*?\/figmeta\)-->/gs, '');
  cleaned = cleaned.replace(/<!--\(figma\).*?\/figma\)-->/gs, '');
  cleaned = cleaned.replace(/<!--.*?-->/gs, '');
  
  // 2. Remove span tags with data-metadata or data-buffer attributes
  cleaned = cleaned.replace(/<span\s+data-(metadata|buffer)="[^"]*"><\/span>/g, '');
  
  // 3. Remove style attributes
  cleaned = cleaned.replace(/\s+style="[^"]*"/g, '');
  
  // 4. Replace spans with their content
  cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/gs, '$1');
  
  // 5. Sanitize HTML to remove potentially malicious content
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target']
  });
  
  // 6. Log the before and after sizes to confirm cleaning is working
  console.log(`Content cleaning: ${htmlContent.length} -> ${cleaned.length} chars (${Math.round((htmlContent.length - cleaned.length) / htmlContent.length * 100)}% reduction)`);
  
  return cleaned.trim();
};

// Get all community posts
const getAllPosts = (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Query to get total count of posts
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM community_posts
  `;

  // Query to get paginated posts with user info
  const postsQuery = `
    SELECT 
      p.postID, 
      p.subject, 
      p.content, 
      p.createdAt, 
      p.updatedAt,
      u.userID,
      u.username, 
      u.profilePicture,
      (SELECT COUNT(*) FROM community_comments WHERE postID = p.postID) as commentCount
    FROM 
      community_posts p
    JOIN 
      users u ON p.userID = u.userID
    ORDER BY 
      p.createdAt DESC
    LIMIT ? OFFSET ?
  `;

  // Execute count query
  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting posts:", err);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    const totalPosts = countResult[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    // Execute posts query
    db.query(postsQuery, [limit, offset], (err, posts) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Failed to fetch posts" });
      }

      // Format dates for each post
      const formattedPosts = posts.map(post => {
        return {
          ...post,
          createdAt: new Date(post.createdAt).toISOString(),
          updatedAt: new Date(post.updatedAt).toISOString()
        };
      });

      // Send response with pagination info
      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            total: totalPosts,
            page,
            limit,
            totalPages
          }
        }
      });
    });
  });
};

// Get a specific post with comments
const getPostById = (req, res) => {
  const postID = req.params.id;

  // Query to get post details
  const postQuery = `
    SELECT 
      p.postID, 
      p.subject, 
      p.content, 
      p.createdAt, 
      p.updatedAt,
      u.userID,
      u.username, 
      u.profilePicture
    FROM 
      community_posts p
    JOIN 
      users u ON p.userID = u.userID
    WHERE 
      p.postID = ?
  `;

  // Query to get comments for the post
  const commentsQuery = `
    SELECT 
      c.commentID, 
      c.content, 
      c.createdAt,
      u.userID, 
      u.username, 
      u.profilePicture
    FROM 
      community_comments c
    JOIN 
      users u ON c.userID = u.userID
    WHERE 
      c.postID = ?
    ORDER BY 
      c.createdAt ASC
  `;

  // Execute post query
  db.query(postQuery, [postID], (err, posts) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({ error: "Failed to fetch post" });
    }

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts[0];

    // Execute comments query
    db.query(commentsQuery, [postID], (err, comments) => {
      if (err) {
        console.error("Error fetching comments:", err);
        return res.status(500).json({ error: "Failed to fetch comments" });
      }

      // Format dates for post and comments
      const formattedPost = {
        ...post,
        createdAt: new Date(post.createdAt).toISOString(),
        updatedAt: new Date(post.updatedAt).toISOString(),
        comments: comments.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt).toISOString()
        }))
      };

      res.json({
        success: true,
        data: formattedPost
      });
    });
  });
};

// Create a new post
const createPost = (req, res) => {
  const userID = req.session.user.id;
  const { subject, content } = req.body;

  // Validate input
  if (!subject || !content) {
    return res.status(400).json({ error: "Subject and content are required" });
  }

  // Clean content before storing in the database
  const cleanedContent = cleanContent(content);

  // Prepare post data
  const postData = {
    userID,
    subject,
    content: cleanedContent, // Use the cleaned content
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert post into database
  const query = `
    INSERT INTO community_posts 
    (userID, subject, content, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(
    query, 
    [postData.userID, postData.subject, postData.content, postData.createdAt, postData.updatedAt],
    (err, result) => {
      if (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({ error: "Failed to create post" });
      }

      // Return success with post ID
      res.status(201).json({
        success: true,
        data: {
          postID: result.insertId,
          message: "Post created successfully"
        }
      });
    }
  );
};

// Add a comment to a post
const addComment = (req, res) => {
  const userID = req.session.user.id;
  const postID = req.params.id;
  const { content } = req.body;

  // Validate input
  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  // Clean comment content before storing
  const cleanedContent = cleanContent(content);

  // Check if post exists
  const checkPostQuery = "SELECT postID FROM community_posts WHERE postID = ?";
  
  db.query(checkPostQuery, [postID], (err, posts) => {
    if (err) {
      console.error("Error checking post:", err);
      return res.status(500).json({ error: "Failed to add comment" });
    }

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Prepare comment data
    const commentData = {
      postID,
      userID,
      content: cleanedContent, // Use the cleaned content
      createdAt: new Date()
    };

    // Insert comment into database
    const query = `
      INSERT INTO community_comments 
      (postID, userID, content, createdAt) 
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(
      query, 
      [commentData.postID, commentData.userID, commentData.content, commentData.createdAt],
      (err, result) => {
        if (err) {
          console.error("Error adding comment:", err);
          return res.status(500).json({ error: "Failed to add comment" });
        }

        // Return success with comment ID
        res.status(201).json({
          success: true,
          data: {
            commentID: result.insertId,
            message: "Comment added successfully"
          }
        });
      }
    );
  });
};

// Delete a post (only the post owner can do this)
const deletePost = (req, res) => {
  const userID = req.session.user.id;
  const postID = req.params.id;

  // Check if user owns the post
  const checkOwnershipQuery = `
    SELECT userID FROM community_posts WHERE postID = ?
  `;
  
  db.query(checkOwnershipQuery, [postID], (err, posts) => {
    if (err) {
      console.error("Error checking post ownership:", err);
      return res.status(500).json({ error: "Failed to delete post" });
    }

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (posts[0].userID !== userID) {
      return res.status(403).json({ error: "You don't have permission to delete this post" });
    }

    // First delete all comments related to the post
    const deleteCommentsQuery = `
      DELETE FROM community_comments WHERE postID = ?
    `;
    
    db.query(deleteCommentsQuery, [postID], (err) => {
      if (err) {
        console.error("Error deleting comments:", err);
        return res.status(500).json({ error: "Failed to delete post" });
      }

      // Then delete the post
      const deletePostQuery = `
        DELETE FROM community_posts WHERE postID = ?
      `;
      
      db.query(deletePostQuery, [postID], (err, result) => {
        if (err) {
          console.error("Error deleting post:", err);
          return res.status(500).json({ error: "Failed to delete post" });
        }

        res.json({
          success: true,
          data: {
            message: "Post deleted successfully"
          }
        });
      });
    });
  });
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  addComment,
  deletePost
};