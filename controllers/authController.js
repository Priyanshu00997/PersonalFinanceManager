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

        res.send("Login Successful ✅");
        res.redirect("/dashboard");
    });
};
