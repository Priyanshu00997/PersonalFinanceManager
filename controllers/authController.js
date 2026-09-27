const db = require("../config/db");

exports.showRegister = (req, res) => {
    res.render("register");
};

exports.showLogin = (req, res) => {
    res.render("login");
};

exports.registerUser = (req, res) => {
    const { fullname, email, password } = req.body;

    const sql = `
        INSERT INTO users(full_name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [fullname, email, password], (err) => {
        if (err) {
            console.log(err);
            return res.send("Registration Failed");
        }

        res.redirect("/login");
    });
};
exports.loginUser = (req, res) => {

    console.log("LOGIN FUNCTION CALLED");

    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);

    const sql = `
        SELECT * FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], (err, results) => {

        if (err) {
            console.log("Database Error:", err);
            return res.send("Database Error");
        }

        console.log("Results:", results);

        if (results.length === 0) {
            return res.send("Invalid email or password");
        }

        const user = results[0];

        if (user.password !== password) {
            return res.send("Invalid email or password");
        }

        // Store logged-in user's ID in session
        req.session.userId = user.id;

        console.log("Logged in User ID:", req.session.userId);


        // Find user's shared account
        const sharedAccountSql = `
            SELECT shared_account_id
            FROM shared_account_members
            WHERE user_id = ?
            LIMIT 1
        `;

        db.query(
            sharedAccountSql,
            [user.id],
            (err, sharedResults) => {

                if (err) {
                    console.log("Shared Account Session Error:", err);
                    return res.send("Database Error");
                }

                if (sharedResults.length > 0) {

                    req.session.sharedAccountId =
                        sharedResults[0].shared_account_id;

                    console.log(
                        "Shared Account ID:",
                        req.session.sharedAccountId
                    );

                } else {

                    req.session.sharedAccountId = null;

                    console.log("No shared account");

                }

                res.redirect("/dashboard");

            }
        );
    });
};

exports.showDashboard = (req, res) => {

    // Check if user is logged in
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const sharedAccountId = req.session.sharedAccountId;


    // ==========================================
    // PERSONAL ACCOUNT
    // ==========================================

    if (!sharedAccountId) {

        const summarySql = `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) AS totalIncome,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) AS totalExpense

            FROM transactions

            WHERE user_id = ?
            AND shared_account_id IS NULL
        `;


        const recentSql = `
            SELECT *
            FROM transactions

            WHERE user_id = ?
            AND shared_account_id IS NULL

            ORDER BY id DESC

            LIMIT 5
        `;


        const categorySql = `
            SELECT
                category,
                SUM(amount) AS total

            FROM transactions

            WHERE user_id = ?
            AND shared_account_id IS NULL
            AND type = 'expense'

            GROUP BY category

            ORDER BY total DESC
        `;


        db.query(summarySql, [userId], (err, summaryResult) => {

            if (err) {
                console.log("Dashboard Summary Error:", err);
                return res.send("Dashboard Database Error");
            }


            db.query(recentSql, [userId], (err, recentTransactions) => {

                if (err) {
                    console.log("Recent Transactions Error:", err);
                    return res.send("Dashboard Database Error");
                }


                db.query(categorySql, [userId], (err, categoryResult) => {

                    if (err) {
                        console.log("Category Chart Error:", err);
                        return res.send("Dashboard Database Error");
                    }


                    const totalIncome =
                        Number(summaryResult[0].totalIncome);

                    const totalExpense =
                        Number(summaryResult[0].totalExpense);

                    const balance =
                        totalIncome - totalExpense;


                    const categoryLabels =
                        categoryResult.map(
                            item => item.category
                        );

                    const categoryValues =
                        categoryResult.map(
                            item => Number(item.total)
                        );


                    res.render("dashboard", {

                        totalIncome,
                        totalExpense,
                        balance,
                        recentTransactions,

                        categoryLabels,
                        categoryValues,

                        sharedAccount: null

                    });

                });

            });

        });

        return;
    }


    // ==========================================
    // SHARED ACCOUNT
    // ==========================================

    const summarySql = `
        SELECT

            COALESCE(
                SUM(
                    CASE
                        WHEN type = 'income'
                        THEN amount
                        ELSE 0
                    END
                ), 0
            ) AS totalIncome,

            COALESCE(
                SUM(
                    CASE
                        WHEN type = 'expense'
                        THEN amount
                        ELSE 0
                    END
                ), 0
            ) AS totalExpense

        FROM transactions

        WHERE shared_account_id = ?
    `;


    const recentSql = `
        SELECT *
        FROM transactions

        WHERE shared_account_id = ?

        ORDER BY id DESC

        LIMIT 5
    `;


    const categorySql = `
        SELECT
            category,
            SUM(amount) AS total

        FROM transactions

        WHERE shared_account_id = ?
        AND type = 'expense'

        GROUP BY category

        ORDER BY total DESC
    `;


    // Get shared account details
    const accountSql = `
        SELECT
            sa.id,
            sa.account_name,
            sa.invite_code,
            COUNT(sam.user_id) AS memberCount

        FROM shared_accounts sa

        LEFT JOIN shared_account_members sam
            ON sa.id = sam.shared_account_id

        WHERE sa.id = ?

        GROUP BY
            sa.id,
            sa.account_name,
            sa.invite_code
    `;


    db.query(
        summarySql,
        [sharedAccountId],
        (err, summaryResult) => {

            if (err) {
                console.log(
                    "Shared Dashboard Summary Error:",
                    err
                );

                return res.send(
                    "Dashboard Database Error"
                );
            }


            db.query(
                recentSql,
                [sharedAccountId],
                (err, recentTransactions) => {

                    if (err) {
                        console.log(
                            "Shared Recent Transactions Error:",
                            err
                        );

                        return res.send(
                            "Dashboard Database Error"
                        );
                    }


                    db.query(
                        categorySql,
                        [sharedAccountId],
                        (err, categoryResult) => {

                            if (err) {
                                console.log(
                                    "Shared Category Chart Error:",
                                    err
                                );

                                return res.send(
                                    "Dashboard Database Error"
                                );
                            }


                            db.query(
                                accountSql,
                                [sharedAccountId],
                                (err, accountResult) => {

                                    if (err) {
                                        console.log(
                                            "Shared Account Details Error:",
                                            err
                                        );

                                        return res.send(
                                            "Dashboard Database Error"
                                        );
                                    }


                                    const sharedAccount =
                                        accountResult.length > 0
                                            ? accountResult[0]
                                            : null;


                                    const totalIncome =
                                        Number(
                                            summaryResult[0].totalIncome
                                        );


                                    const totalExpense =
                                        Number(
                                            summaryResult[0].totalExpense
                                        );


                                    const balance =
                                        totalIncome - totalExpense;


                                    const categoryLabels =
                                        categoryResult.map(
                                            item => item.category
                                        );


                                    const categoryValues =
                                        categoryResult.map(
                                            item => Number(item.total)
                                        );


                                    res.render("dashboard", {

                                        totalIncome,
                                        totalExpense,
                                        balance,
                                        recentTransactions,

                                        categoryLabels,
                                        categoryValues,

                                        sharedAccount

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};