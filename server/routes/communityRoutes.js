const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Get all posts (paginated)
router.get("/posts", communityController.getAllPosts);

// Get a specific post with comments
router.get("/posts/:id", communityController.getPostById);

// Create a new post
router.post("/posts", isAuthenticated, communityController.createPost);

// Update an existing post
router.put("/posts/:id", isAuthenticated, communityController.updatePost);

// Add a comment to a post
router.post("/posts/:id/comments", isAuthenticated, communityController.addComment);

// Delete a post
router.delete("/posts/:id", isAuthenticated, communityController.deletePost);

// Like/unlike a post
router.post("/posts/:id/like", isAuthenticated, communityController.toggleLike);

// Get likes for a post
router.get("/posts/:id/likes", communityController.getLikes);

module.exports = router;