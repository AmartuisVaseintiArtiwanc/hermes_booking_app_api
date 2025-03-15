const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Register a new user
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  ],
  userController.registerUser
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  userController.loginUser
);

// Protected route (Profile)
router.get("/profile", authenticateToken, userController.getProfile);

module.exports = router;
