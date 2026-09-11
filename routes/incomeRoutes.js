const express = require("express");
const router = express.Router();
console.log("✅ INCOME ROUTES LOADED");

const db = require("../config/db");

// Show Add Income Page
router.get("/income", (req, res) => {
    res.render("addIncome");
});

// Add Income
router.post("/income", (req, res) => {

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
        VALUES (?, 'income', ?, ?, ?, ?)
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
                console.log("Income Error:", err);
                return res.send("Failed to add income");
            }

            console.log("✅ Income Added Successfully");

            res.redirect("/dashboard");
        }
    );
});

module.exports = router;