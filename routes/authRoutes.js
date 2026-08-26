const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Registration routes
router.get("/register", authController.showRegister);
router.post("/register", authController.registerUser);

// Login routes
router.get("/login", authController.showLogin);
// router.post("/login", authController.loginUser);

// Dashboard route
// router.get("/dashboard", (req, res) => {
//     res.render("dashboard");
// });
router.get("/dashboard", authController.showDashboard);

module.exports = router;