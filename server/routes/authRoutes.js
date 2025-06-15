const express = require("express");
const router = express.Router();
const signinController = require("../controllers/signinController");
const signupController = require("../controllers/signupController");

// Authentication routes
router.post("/sign-in", signinController.signIn);
router.post("/sign-up", signupController.signUp);
router.post("/sign-out", signinController.signOut);
router.get("/check-auth", signinController.checkAuth);

module.exports = router;