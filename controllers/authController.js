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