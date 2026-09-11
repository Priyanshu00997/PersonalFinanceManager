const express = require("express");
const router = express.Router();

const db = require("../config/db");

// Show Add Expense Page
router.get("/expense", (req, res) => {
    res.render("addExpense");
});

// Add Expense
router.post("/expense", (req, res) => {

    const {
        amount,
        category,
        description,
        transaction_date
    } = req.body;

    const user_id = 1;

    const sql = `
        INSERT INTO transactions
        (user_id, type, amount, category, description, transaction_date)
        VALUES (?, 'expense', ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            amount,
            category,
            description,
            transaction_date
        ],
        (err) => {

            if (err) {
                console.log("Expense Error:", err);
                return res.send("Failed to add expense");
            }

            console.log("✅ Expense Added Successfully");

            res.redirect("/dashboard");
        }
    );
});

module.exports = router;