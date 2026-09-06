const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Registration
router.get("/register", authController.showRegister);
router.post("/register", authController.registerUser);

// Login
router.get("/login", authController.showLogin);
router.post("/login", authController.loginUser);

// Dashboard
router.get("/dashboard", authController.showDashboard);

module.exports = router;