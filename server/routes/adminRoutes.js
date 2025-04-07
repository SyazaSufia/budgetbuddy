const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Get all users (protected route)
router.get("/users", isAuthenticated, adminController.getAllUsers);
// Delete a user
router.delete("/users/:id", isAuthenticated, adminController.deleteUser);

module.exports = router;
