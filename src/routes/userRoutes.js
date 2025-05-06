const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Register new user
router.post("/register", userController.register);

// Login user
router.post("/login", userController.login);

module.exports = router;
