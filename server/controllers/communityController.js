const db = require("../db");

// You may need to install these packages: npm install dompurify jsdom
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Enhanced function to clean HTML content
// This is the key issue in your cleanContent function in communityController.js

const cleanContent = (htmlContent) => {
  if (!htmlContent) return "";

  // *** CRITICAL FIX #1: Check if content is already escaped ***
  // If HTML is coming in with &lt; instead of <, we need to unescape it first
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

  // *** CRITICAL FIX #2: Ensure we're not returning HTML-escaped content ***
  // Make sure we're not returning content with escaped HTML entities
  if (cleaned.includes('&lt;') || cleaned.includes('&gt;')) {
    console.log("Warning: Content still contains escaped HTML entities after cleaning");
  }

  return cleaned.trim();
};

// Get all community posts
const getAllPosts = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query to get total count of posts
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM community_posts
    `;

    // Updated query to get paginated posts with user info, comment count AND like count
    const postsQuery = `
      SELECT 
        p.postID, 
        p.subject, 
        p.content, 
        p.createdAt,
        u.userID,
        u.username, 
        u.profileImage,
        (SELECT COUNT(*) FROM community_comments WHERE postID = p.postID) as commentCount,
        (SELECT COUNT(*) FROM post_likes WHERE postID = p.postID) as likeCount
      FROM 
        community_posts p
      JOIN 
        user u ON p.userID = u.userID
      ORDER BY 
        p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    // Execute count query
    const countResult = await db.query(countQuery);
    const totalPosts = countResult[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    // Execute posts query
    const posts = await db.query(postsQuery, [limit, offset]);

    // Format dates for each post
    const formattedPosts = posts.map((post) => {
      return {
        ...post,
        createdAt: new Date(post.createdAt).toISOString(),
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
          totalPages,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts", details: err.message });
  }
};

// Create a new post with ISO date format
const createPost = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { subject, content } = req.body;

    // Validate input
    if (!subject || !content) {
      return res
        .status(400)
        .json({ error: "Subject and content are required" });
    }

    // Clean content before storing in the database
    // Important: Make sure we're not double-escaping HTML
    const cleanedContent = cleanContent(content);
    
    // If there's a significant difference in length, something might be wrong
    if (Math.abs(content.length - cleanedContent.length) > content.length * 0.5) {
      console.log("WARNING: Large difference between original and cleaned content!");
    }

    // Use ISO string format for dates (ensures consistent timezone handling)
    const now = new Date().toISOString();

    // Prepare post data
    const postData = {
      userID,
      subject,
      content: cleanedContent,
      createdAt: now,
    };

    // Insert post into database
    const query = `
      INSERT INTO community_posts 
      (userID, subject, content, createdAt) 
      VALUES (?, ?, ?, ?)
    `;

    // IMPORTANT: Log the actual content being saved to the database
    console.log("Content being saved to database:", cleanedContent);

    const result = await db.query(query, [
      postData.userID,
      postData.subject,
      postData.content,
      postData.createdAt,
    ]);

    // Return success with post ID
    res.status(201).json({
      success: true,
      data: {
        postID: result.insertId,
        message: "Post created successfully",
      },
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post", details: err.message });
  }
};

// Add a comment with ISO date format
const addComment = async (req, res) => {
  try {
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
    const checkPostQuery =
      "SELECT postID FROM community_posts WHERE postID = ?";

    const posts = await db.query(checkPostQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Use ISO string format for dates (ensures consistent timezone handling)
    const now = new Date().toISOString();

    // Prepare comment data
    const commentData = {
      postID,
      userID,
      content: cleanedContent,
      createdAt: now,
    };

    // Insert comment into database
    const query = `
      INSERT INTO community_comments 
      (postID, userID, content, createdAt) 
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      commentData.postID,
      commentData.userID,
      commentData.content,
      commentData.createdAt,
    ]);

    // Return success with comment ID
    res.status(201).json({
      success: true,
      data: {
        commentID: result.insertId,
        message: "Comment added successfully",
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment", details: err.message });
  }
};

// Delete a post (only the post owner can do this)
const deletePost = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const postID = req.params.id;

    // Check if user owns the post
    const checkOwnershipQuery = `
      SELECT userID FROM community_posts WHERE postID = ?
    `;

    const posts = await db.query(checkOwnershipQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (posts[0].userID !== userID) {
      return res
        .status(403)
        .json({ error: "You don't have permission to delete this post" });
    }

    // First delete all comments related to the post
    const deleteCommentsQuery = `
      DELETE FROM community_comments WHERE postID = ?
    `;

    await db.query(deleteCommentsQuery, [postID]);

    // Then delete the post
    const deletePostQuery = `
      DELETE FROM community_posts WHERE postID = ?
    `;

    await db.query(deletePostQuery, [postID]);

    res.json({
      success: true,
      data: {
        message: "Post deleted successfully",
      },
    });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post", details: err.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const postID = req.params.id;

    // Check if post exists
    const checkPostQuery = "SELECT postID FROM community_posts WHERE postID = ?";
    const posts = await db.query(checkPostQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user already liked the post
    const checkLikeQuery = `
      SELECT likeID FROM post_likes 
      WHERE postID = ? AND userID = ?
    `;
    
    const likes = await db.query(checkLikeQuery, [postID, userID]);
    
    if (likes.length > 0) {
      // User already liked the post, so unlike it
      const unlikeQuery = `
        DELETE FROM post_likes 
        WHERE postID = ? AND userID = ?
      `;
      
      await db.query(unlikeQuery, [postID, userID]);
      
      res.json({
        success: true,
        data: {
          liked: false,
          message: "Post unliked successfully"
        }
      });
    } else {
      // User hasn't liked the post, so like it
      const likeQuery = `
        INSERT INTO post_likes 
        (postID, userID, createdAt) 
        VALUES (?, ?, ?)
      `;
      
      await db.query(likeQuery, [postID, userID, new Date()]);
      
      res.json({
        success: true,
        data: {
          liked: true,
          message: "Post liked successfully"
        }
      });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Failed to toggle like status", details: err.message });
  }
};

// Get likes count for a post
const getLikes = async (req, res) => {
  try {
    const postID = req.params.id;
    const userID = req.session.user ? req.session.user.id : null;

    // Check if post exists
    const checkPostQuery = "SELECT postID FROM community_posts WHERE postID = ?";
    const posts = await db.query(checkPostQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Get like count
    const countQuery = `
      SELECT COUNT(*) as likeCount FROM post_likes 
      WHERE postID = ?
    `;
    
    const countResult = await db.query(countQuery, [postID]);
    const likeCount = countResult[0].likeCount;

    // Check if current user liked the post
    let userLiked = false;
    
    if (userID) {
      const userLikeQuery = `
        SELECT 1 FROM post_likes 
        WHERE postID = ? AND userID = ?
      `;
      
      const userLikes = await db.query(userLikeQuery, [postID, userID]);
      userLiked = userLikes.length > 0;
    }

    res.json({
      success: true,
      data: {
        likeCount,
        userLiked
      }
    });
  } catch (err) {
    console.error("Error getting likes:", err);
    res.status(500).json({ error: "Failed to get likes", details: err.message });
  }
};

// Modify the existing getPostById to include like information
const getPostById = async (req, res) => {
  try {
    const postID = req.params.id;
    const userID = req.session.user ? req.session.user.id : null;

    // Query to get post details
    const postQuery = `
      SELECT 
        p.postID, 
        p.subject, 
        p.content, 
        p.createdAt,
        u.userID,
        u.username, 
        u.profileImage
      FROM 
        community_posts p
      JOIN 
        user u ON p.userID = u.userID
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
        u.profileImage
      FROM 
        community_comments c
      JOIN 
        user u ON c.userID = u.userID
      WHERE 
        c.postID = ?
      ORDER BY 
        c.createdAt ASC
    `;

    // Query to get like count
    const likesQuery = `
      SELECT COUNT(*) as likeCount 
      FROM post_likes 
      WHERE postID = ?
    `;

    // Query to check if current user liked the post
    const userLikedQuery = `
      SELECT 1 FROM post_likes 
      WHERE postID = ? AND userID = ?
    `;

    // Execute post query
    const posts = await db.query(postQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts[0];

    // Execute comments query
    const comments = await db.query(commentsQuery, [postID]);

    // Execute likes query
    const likesResult = await db.query(likesQuery, [postID]);
    const likeCount = likesResult[0].likeCount;

    // Check if user liked the post
    let userLiked = false;
    if (userID) {
      const userLikedResult = await db.query(userLikedQuery, [postID, userID]);
      userLiked = userLikedResult.length > 0;
    }

    // Format dates for post and comments
    const formattedPost = {
      ...post,
      createdAt: new Date(post.createdAt).toISOString(),
      comments: comments.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt).toISOString(),
      })),
      likes: {
        count: likeCount,
        userLiked
      }
    };

    res.json({
      success: true,
      data: formattedPost,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Failed to fetch post", details: err.message });
  }
};

// Update an existing post
const updatePost = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const postID = req.params.id;
    const { subject, content } = req.body;

    // Validate input
    if (!subject || !content) {
      return res
        .status(400)
        .json({ error: "Subject and content are required" });
    }

    // Check if user owns the post
    const checkOwnershipQuery = `
      SELECT userID FROM community_posts WHERE postID = ?
    `;

    const posts = await db.query(checkOwnershipQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (posts[0].userID !== userID) {
      return res
        .status(403)
        .json({ error: "You don't have permission to update this post" });
    }

    // Clean content before storing in the database
    const cleanedContent = cleanContent(content);

    // Update post in database
    const query = `
      UPDATE community_posts 
      SET subject = ?, content = ?
      WHERE postID = ?
    `;

    await db.query(query, [subject, cleanedContent, postID]);

    // Return success
    res.json({
      success: true,
      data: {
        message: "Post updated successfully",
      },
    });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Failed to update post", details: err.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  addComment,
  deletePost,
  toggleLike,
  getLikes,
  updatePost
};