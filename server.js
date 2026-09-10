const express = require("express");
const path = require("path");

require("dotenv").config();

const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/ExpenseRoutes");

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
    res.redirect("/register");
});

// Application routes
app.use("/", authRoutes);
app.use("/", transactionRoutes);
app.use("/", incomeRoutes);
app.use("/", expenseRoutes);
app.use("/", dashboardRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});