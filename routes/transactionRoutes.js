const express = require("express");
const router = express.Router();

const db = require("../config/db");

// Show transaction form
router.get("/transaction", (req, res) => {
    res.render("transaction");
});

// Add transaction
router.post("/transaction", (req, res) => {

    const {
        type,
        amount,
        category,
        description,
        transaction_date
    } = req.body;

    const user_id = 1; // temporary user

    const sql = `
        INSERT INTO transactions
        (user_id, type, amount, category, description, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            type,
            amount,
            category,
            description,
            transaction_date
        ],
        (err) => {

            if (err) {
                console.log("Transaction Error:", err);
                return res.send("Failed to add transaction");
            }

            res.redirect("/dashboard");
        }
    );
});

module.exports = router;
