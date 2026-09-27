const express = require("express");
const router = express.Router();

const db = require("../config/db");


// ==========================================
// SHOW ADD INCOME PAGE
// ==========================================

router.get("/income", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.render("addIncome");

});


// ==========================================
// ADD INCOME
// ==========================================

router.post("/income", (req, res) => {

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
        VALUES (?, ?, ?, 'income', ?, ?, ?, ?)
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

                console.log("Income Error:", err);

                return res.send(
                    "Failed to add income"
                );

            }


            console.log(
                "✅ Income Added Successfully"
            );


            res.redirect("/dashboard");

        }
    );

});


module.exports = router;