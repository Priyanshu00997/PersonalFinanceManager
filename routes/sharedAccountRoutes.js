const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// SHOW SHARED ACCOUNT PAGE
// ==========================================
// SHOW SHARED ACCOUNT PAGE

router.get("/shared-account", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    const accountSql = `
        SELECT
            sa.id,
            sa.account_name,
            sa.invite_code,
            sa.created_by,
            COUNT(sam.user_id) AS memberCount

        FROM shared_accounts sa

        INNER JOIN shared_account_members sam
            ON sa.id = sam.shared_account_id

        WHERE sam.user_id = ?

        GROUP BY
            sa.id,
            sa.account_name,
            sa.invite_code,
            sa.created_by

        LIMIT 1
    `;


    db.query(
        accountSql,
        [userId],
        (err, accountResults) => {

            if (err) {
                console.log(
                    "Shared Account Load Error:",
                    err
                );

                return res.send("Database Error");
            }


            // No shared account
            if (accountResults.length === 0) {

                return res.render("sharedAccount", {
                    sharedAccount: null,
                    members: []
                });

            }


            const sharedAccount = accountResults[0];


            // Get all members
            const membersSql = `
                SELECT
                    u.id,
                    u.full_name,
                    u.email,
                    sam.joined_at

                FROM shared_account_members sam

                INNER JOIN users u
                    ON sam.user_id = u.id

                WHERE sam.shared_account_id = ?

                ORDER BY
                    sam.user_id = ? DESC,
                    u.id ASC
            `;


            db.query(
                membersSql,
                [
                    sharedAccount.id,
                    sharedAccount.created_by
                ],
                (err, members) => {

                    if (err) {
                        console.log(
                            "Shared Members Load Error:",
                            err
                        );

                        return res.send(
                            "Database Error"
                        );
                    }


                    res.render("sharedAccount", {

                        sharedAccount,
                        members

                    });

                }
            );

        }
    );

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

// REMOVE MEMBER FROM SHARED ACCOUNT
router.post("/shared-account/remove-member/:userId", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const currentUserId = req.session.userId;
    const memberUserId = req.params.userId;
    const sharedAccountId = req.session.sharedAccountId;

    if (!sharedAccountId) {
        return res.redirect("/shared-account");
    }

    // Check if current user is the owner
    const ownerSql = `
        SELECT created_by
        FROM shared_accounts
        WHERE id = ?
    `;

    db.query(
        ownerSql,
        [sharedAccountId],
        (err, results) => {

            if (err) {
                console.log("Owner Check Error:", err);
                return res.send("Database Error");
            }

            if (results.length === 0) {
                return res.send("Shared account not found");
            }

            const ownerId = results[0].created_by;

            // Only owner can remove members
            if (Number(ownerId) !== Number(currentUserId)) {
                return res.send(
                    "Only the shared account owner can remove members"
                );
            }

            // Prevent owner from removing themselves
            if (Number(memberUserId) === Number(ownerId)) {
                return res.send(
                    "The account owner cannot be removed"
                );
            }

            const deleteSql = `
                DELETE FROM shared_account_members
                WHERE shared_account_id = ?
                AND user_id = ?
            `;

            db.query(
                deleteSql,
                [sharedAccountId, memberUserId],
                (err, result) => {

                    if (err) {
                        console.log(
                            "Remove Member Error:",
                            err
                        );

                        return res.send(
                            "Failed to remove member"
                        );
                    }

                    if (result.affectedRows === 0) {
                        return res.send(
                            "Member not found"
                        );
                    }

                    console.log(
                        "✅ Member Removed:",
                        memberUserId
                    );

                    res.redirect("/shared-account");

                }
            );

        }
    );

});
module.exports = router;