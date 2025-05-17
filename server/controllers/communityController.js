const db = require("../db");

// You may need to install these packages: npm install dompurify jsdom
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Enhanced function to clean HTML content
const cleanContent = (htmlContent) => {
  if (!htmlContent) return "";

  // 1. Remove Figma metadata and other comments
  let cleaned = htmlContent.replace(/<!--\(figmeta\).*?\/figmeta\)-->/gs, "");
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
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "u",
      "ol",
      "ul",
      "li",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target"],
  });

  // 6. Log the before and after sizes to confirm cleaning is working
  console.log(
    `Content cleaning: ${htmlContent.length} -> ${cleaned.length} chars (${Math.round(((htmlContent.length - cleaned.length) / htmlContent.length) * 100)}% reduction)`
  );

  return cleaned.trim();
};

// Get all community posts
const getAllPosts = async (req, res) => {
  try {
    console.log("getAllPosts called");
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
        u.userID,
        u.username, 
        u.profileImage,
        (SELECT COUNT(*) FROM community_comments WHERE postID = p.postID) as commentCount
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

// Get a specific post with comments
const getPostById = async (req, res) => {
  try {
    const postID = req.params.id;

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

    // Execute post query
    const posts = await db.query(postQuery, [postID]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts[0];

    // Execute comments query
    const comments = await db.query(commentsQuery, [postID]);

    // Format dates for post and comments
    const formattedPost = {
      ...post,
      createdAt: new Date(post.createdAt).toISOString(),
      comments: comments.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt).toISOString(),
      })),
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

// Create a new post
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
    const cleanedContent = cleanContent(content);

    // Prepare post data
    const postData = {
      userID,
      subject,
      content: cleanedContent, // Use the cleaned content
      createdAt: new Date(),
    };

    // Insert post into database
    const query = `
      INSERT INTO community_posts 
      (userID, subject, content, createdAt) 
      VALUES (?, ?, ?, ?)
    `;

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

// Add a comment to a post
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

    // Prepare comment data
    const commentData = {
      postID,
      userID,
      content: cleanedContent, // Use the cleaned content
      createdAt: new Date(),
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

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  addComment,
  deletePost,
};