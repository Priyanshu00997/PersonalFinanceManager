const express = require("express");
const router = express.Router();

const db = require("../config/db");

// Show Add Expense Page
router.get("/expense", (req, res) => {
    res.render("addExpense");
});

// Add Expense
// Add Expense
router.post("/expense", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    const sharedAccountId =
        req.session.sharedAccountId || null;

    const {
        amount,
        category,
        description,
        transaction_date
    } = req.body;


    const sql = `
        INSERT INTO transactions
        (
            user_id,
            shared_account_id,
            created_by,
            type,
            amount,
            category,
            description,
            transaction_date
        )
        VALUES (?, ?, ?, 'expense', ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            userId,
            sharedAccountId,
            userId,
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