const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// SHOW SHARED ACCOUNT PAGE
// ==========================================

router.get("/shared-account", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    const sql = `
        SELECT
            sa.id,
            sa.account_name,
            sa.invite_code
        FROM shared_accounts sa
        INNER JOIN shared_account_members sam
            ON sa.id = sam.shared_account_id
        WHERE sam.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.log("Shared Account Load Error:", err);
            return res.send("Database Error");
        }

        res.render("sharedAccount", {
            sharedAccount: results.length > 0 ? results[0] : null
        });

    });

});


// ==========================================
// CREATE SHARED ACCOUNT
// ==========================================

router.post("/shared-account/create", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { account_name } = req.body;

    // Generate 6-digit invite code
    const inviteCode =
        Math.floor(100000 + Math.random() * 900000).toString();

    const createSql = `
        INSERT INTO shared_accounts
        (account_name, invite_code, created_by)
        VALUES (?, ?, ?)
    `;

    db.query(
        createSql,
        [account_name, inviteCode, userId],
        (err, result) => {

            if (err) {
                console.log("Create Shared Account Error:", err);
                return res.send("Failed to create shared account");
            }

            const sharedAccountId = result.insertId;

            const memberSql = `
                INSERT INTO shared_account_members
                (shared_account_id, user_id)
                VALUES (?, ?)
            `;

            db.query(
                memberSql,
                [sharedAccountId, userId],
                (err) => {

                    if (err) {
                        console.log("Member Add Error:", err);
                        return res.send("Failed to add account member");
                    }

                    // Store active shared account in session
                    req.session.sharedAccountId = sharedAccountId;

                    console.log(
                        "Shared Account Created:",
                        sharedAccountId
                    );

                    res.redirect("/shared-account");

                }
            );

        }
    );

});


// ==========================================
// JOIN SHARED ACCOUNT
// ==========================================

router.post("/shared-account/join", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { invite_code } = req.body;

    const findSql = `
        SELECT *
        FROM shared_accounts
        WHERE invite_code = ?
    `;

    db.query(
        findSql,
        [invite_code],
        (err, results) => {

            if (err) {
                console.log("Find Shared Account Error:", err);
                return res.send("Database Error");
            }

            if (results.length === 0) {
                return res.send("Invalid invite code");
            }

            const sharedAccount = results[0];

            const memberSql = `
                INSERT IGNORE INTO shared_account_members
                (shared_account_id, user_id)
                VALUES (?, ?)
            `;

            db.query(
                memberSql,
                [sharedAccount.id, userId],
                (err) => {

                    if (err) {
                        console.log("Join Shared Account Error:", err);
                        return res.send("Failed to join shared account");
                    }

                    // Store active shared account in session
                    req.session.sharedAccountId =
                        sharedAccount.id;

                    console.log(
                        "Joined Shared Account:",
                        sharedAccount.id
                    );

                    res.redirect("/shared-account");

                }
            );

        }
    );

});


module.exports = router;