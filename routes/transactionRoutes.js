const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ===============================
// Show Add Transaction Page
// ===============================
router.get("/transaction", (req, res) => {
    res.render("transaction");
});


// ===============================
// Add Transaction
// ===============================
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

            console.log("✅ Transaction Added Successfully");

            res.redirect("/dashboard");
        }
    );
});


// ===============================
// Show Edit Transaction Page
// ===============================
router.get("/transaction/edit/:id", (req, res) => {

    const transactionId = req.params.id;

    const sql = `
        SELECT *
        FROM transactions
        WHERE id = ?
    `;

    db.query(sql, [transactionId], (err, results) => {

        if (err) {
            console.log("Edit Load Error:", err);
            return res.send("Failed to load transaction");
        }

        if (results.length === 0) {
            return res.send("Transaction not found");
        }

        res.render("editTransaction", {
            transaction: results[0]
        });
    });
});


// ===============================
// Update Transaction
// ===============================
router.post("/transaction/edit/:id", (req, res) => {

    const transactionId = req.params.id;

    const {
        type,
        amount,
        category,
        description,
        transaction_date
    } = req.body;

    const sql = `
        UPDATE transactions
        SET type = ?,
            amount = ?,
            category = ?,
            description = ?,
            transaction_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            type,
            amount,
            category,
            description,
            transaction_date,
            transactionId
        ],
        (err) => {

            if (err) {
                console.log("Update Error:", err);
                return res.send("Failed to update transaction");
            }

            console.log("✅ Transaction Updated Successfully");

            res.redirect("/dashboard");
        }
    );
});


// ===============================
// Delete Transaction
// ===============================
router.post("/transaction/delete/:id", (req, res) => {

    const transactionId = req.params.id;

    const user_id = 1; // temporary user

    const sql = `
        DELETE FROM transactions
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [transactionId, user_id],
        (err) => {

            if (err) {
                console.log("Delete Error:", err);
                return res.send("Failed to delete transaction");
            }

            console.log("✅ Transaction Deleted Successfully");

            res.redirect("/dashboard");
        }
    );
});

router.get("/transactions", (req, res) => {

    const user_id = 1;

    const sql = `
        SELECT *
        FROM transactions
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [user_id], (err, transactions) => {

        if (err) {
            console.log("Transaction History Error:", err);
            return res.send("Failed to load transactions");
        }

        res.render("transactionHistory", {
            transactions: transactions
        });
    });
});


module.exports = router;