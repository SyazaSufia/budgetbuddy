const express = require("express");
const router = express.Router();
const adminCommControllers = require("../controllers/adminCommController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/posts", isAuthenticated, adminCommControllers.getAllPosts);
router.get("/posts/:id", isAuthenticated, adminCommControllers.getPostById);
router.put("/posts/:id/status", isAuthenticated, adminCommControllers.updatePostStatus);
router.delete("/posts/:id", isAuthenticated, adminCommControllers.deletePost);

module.exports = router;