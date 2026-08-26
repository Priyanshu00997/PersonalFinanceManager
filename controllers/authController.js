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

        res.redirect("/dashboard");
    });
};
exports.showDashboard = (req, res) => {

    const userId = 1; // temporary: current test user

    const summarySql = `
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
        FROM transactions
        WHERE user_id = ?
    `;

    const recentSql = `
        SELECT *
        FROM transactions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 5
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

            const totalIncome = Number(summaryResult[0].totalIncome);
            const totalExpense = Number(summaryResult[0].totalExpense);
            const balance = totalIncome - totalExpense;

            console.log("Dashboard Summary:");
            console.log("Income:", totalIncome);
            console.log("Expense:", totalExpense);
            console.log("Balance:", balance);
            console.log("Recent Transactions:", recentTransactions);

            res.render("dashboard", {
                totalIncome,
                totalExpense,
                balance,
                recentTransactions
            });

        });
    });
};