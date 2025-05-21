const db = require('../db');

// You may need to install these packages: npm install dompurify jsdom
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Enhanced function to clean HTML content
const cleanContent = (htmlContent) => {
  if (!htmlContent) return "";

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

  // 1. Remove Figma metadata and other comments
  let cleaned = workingContent.replace(/<!--\(figmeta\).*?\/figmeta\)-->/gs, "");
  cleaned = cleaned.replace(/<!--\(figma\).*?\/figma\)-->/gs, "");
  cleaned = cleaned.replace(/<!--.*?-->/gs, "");

  // 2. Remove span tags with data-metadata or data-buffer attributes
  cleaned = cleaned.replace(
    /<span\s+data-(metadata|buffer)="[^"]*"><\/span>/g,
    ""
  );

  // 3. Remove style attributes
  cleaned = cleaned.replace(/\s+style="[^"]*"/g, "");

  // 4. Replace spans with their content
  cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/gs, "$1");

  // 5. Sanitize HTML to remove potentially malicious content
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "u", "ol", "ul", "li",
      "a", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target"],
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: true, // Allow all data-* attributes
  });

  // Ensure we're not returning HTML-escaped content
  if (cleaned.includes('&lt;') || cleaned.includes('&gt;')) {
    console.log("Warning: Content still contains escaped HTML entities after cleaning");
  }

  return cleaned.trim();
};

// Get all community posts with search functionality
const getAllPosts = async (req, res) => {
  try {
    const searchTerm = req.query.search ? `%${req.query.search}%` : null;
    
    let query = `
      SELECT p.postID, p.userID, p.subject, p.content, p.createdAt, p.status, u.username
      FROM community_posts p
      LEFT JOIN user u ON p.userID = u.userID
    `;
    
    let params = [];
    
    // If search term is provided, add WHERE clause
    if (searchTerm) {
      query += `
        WHERE p.subject LIKE ? 
        OR p.content LIKE ?
        OR u.username LIKE ?
      `;
      params = [searchTerm, searchTerm, searchTerm];
    }
    
    // Add order by clause
    query += ` ORDER BY p.createdAt DESC`;
    
    const posts = await db.query(query, params);
    
    // Format posts to include a content preview
    const formattedPosts = posts.map(post => {
      // Create a preview of the content (first 100 characters)
      const contentPreview = post.content.length > 100 
        ? post.content.substring(0, 100) + '...' 
        : post.content;
      
      // Format date to MM-DD-YYYY
      const date = new Date(post.createdAt);
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
      
      return {
        ...post,
        content: contentPreview,
        date: formattedDate,
        status: post.status || 'Pending' // Default status if not present
      };
    });
    
    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch community posts" });
  }
};

// Get a single community post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.*, u.username 
      FROM community_posts p
      LEFT JOIN user u ON p.userID = u.userID
      WHERE p.postID = ?
    `;
    const posts = await db.query(query, [id]);
    
    if (posts.length > 0) {
      // Ensure post has a status
      const post = {
        ...posts[0],
        status: posts[0].status || 'Pending' // Default status if not present
      };
      res.json({ success: true, data: post });
    } else {
      res.status(404).json({ success: false, error: "Post not found" });
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, error: "Failed to fetch post" });
  }
};

// Update a post's status
const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Reviewed', 'Violated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid status. Status must be one of: Pending, Reviewed, Violated" 
      });
    }
    
    // Check if the post exists
    const checkQuery = "SELECT * FROM community_posts WHERE postID = ?";
    const existingPosts = await db.query(checkQuery, [id]);
    
    if (existingPosts.length === 0) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    
    // Update the post status
    const updateQuery = `
      UPDATE community_posts
      SET status = ?
      WHERE postID = ?
    `;
    
    const result = await db.query(updateQuery, [status, id]);
    
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Post status updated successfully" });
    } else {
      res.status(400).json({ success: false, error: "Failed to update post status" });
    }
  } catch (error) {
    console.error("Error updating post status:", error);
    res.status(500).json({ success: false, error: "Failed to update post status" });
  }
};

// Create or update a post with content cleaning
const createOrUpdatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, userID } = req.body;
    
    // Validate required fields
    if (!subject || !content || !userID) {
      return res.status(400).json({
        success: false,
        error: "Subject, content, and userID are required"
      });
    }
    
    // Clean the content before storing
    const cleanedContent = cleanContent(content);
    
    // If there's a significant difference in length, something might be wrong
    if (Math.abs(content.length - cleanedContent.length) > content.length * 0.5) {
      console.log("WARNING: Large difference between original and cleaned content!");
    }
    
    // Log the cleaned content
    console.log("Content being saved to database:", cleanedContent);
    
    if (id) {
      // Update existing post
      const updateQuery = `
        UPDATE community_posts
        SET subject = ?, content = ?
        WHERE postID = ?
      `;
      
      const result = await db.query(updateQuery, [subject, cleanedContent, id]);
      
      if (result.affectedRows > 0) {
        res.json({ 
          success: true, 
          message: "Post updated successfully",
          postID: id
        });
      } else {
        res.status(404).json({ success: false, error: "Post not found" });
      }
    } else {
      // Create new post
      const now = new Date().toISOString();
      
      const insertQuery = `
        INSERT INTO community_posts (userID, subject, content, createdAt, status)
        VALUES (?, ?, ?, ?, 'Pending')
      `;
      
      const result = await db.query(insertQuery, [userID, subject, cleanedContent, now]);
      
      res.status(201).json({
        success: true,
        message: "Post created successfully",
        postID: result.insertId
      });
    }
  } catch (error) {
    console.error("Error creating/updating post:", error);
    res.status(500).json({ success: false, error: "Failed to create/update post" });
  }
};

// Delete a community post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the post exists
    const checkQuery = "SELECT * FROM community_posts WHERE postID = ?";
    const posts = await db.query(checkQuery, [id]);
    
    if (posts.length === 0) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    
    // First delete related comments if they exist
    const deleteCommentsQuery = "DELETE FROM community_comments WHERE postID = ?";
    await db.query(deleteCommentsQuery, [id]);
    
    // Then delete related likes if they exist
    const deleteLikesQuery = "DELETE FROM post_likes WHERE postID = ?";
    await db.query(deleteLikesQuery, [id]);
    
    // Finally delete the post
    const deleteQuery = "DELETE FROM community_posts WHERE postID = ?";
    const result = await db.query(deleteQuery, [id]);
    
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Post deleted successfully" });
    } else {
      res.status(400).json({ success: false, error: "Failed to delete post" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ success: false, error: "Failed to delete post" });
  }
};

// Get all violations (posts with violated status)
const getViolations = async (req, res) => {
  try {
    const query = `
      SELECT p.postID, p.userID, p.subject, p.content, p.createdAt, p.status, u.username
      FROM community_posts p
      LEFT JOIN user u ON p.userID = u.userID
      WHERE p.status = 'Violated'
      ORDER BY p.createdAt DESC
    `;
    
    const posts = await db.query(query);
    
    // Format posts to include a content preview
    const formattedPosts = posts.map(post => {
      // Create a preview of the content (first 100 characters)
      const contentPreview = post.content.length > 100 
        ? post.content.substring(0, 100) + '...' 
        : post.content;
      
      // Format date to MM-DD-YYYY
      const date = new Date(post.createdAt);
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
      
      return {
        ...post,
        content: contentPreview,
        date: formattedDate
      };
    });
    
    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error("Error fetching violations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch violations" });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  updatePostStatus,
  createOrUpdatePost,
  deletePost,
  getViolations,
  cleanContent
};