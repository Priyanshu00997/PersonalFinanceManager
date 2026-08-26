const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/dashboard", (req, res) => {

    const user_id = 1;

    const sql = `
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
        FROM transactions
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {

        if (err) {
            console.log("Dashboard Error:", err);
            return res.send("Dashboard Error");
        }

        const totalIncome = result[0].totalIncome;
        const totalExpense = result[0].totalExpense;
        const balance = totalIncome - totalExpense;

        const recentSql = `
            SELECT *
            FROM transactions
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 5
        `;

        db.query(recentSql, [user_id], (err, transactions) => {

            if (err) {
                console.log("Recent Transactions Error:", err);
                return res.send("Transaction Error");
            }

            res.render("dashboard", {
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                balance: balance,
                transactions: transactions
            });

        });
    });
});

module.exports = router;