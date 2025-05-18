const db = require('../db');

// Get all community posts
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
    
    // Delete the post
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

module.exports = {
  getAllPosts,
  getPostById,
  updatePostStatus,
  deletePost
};