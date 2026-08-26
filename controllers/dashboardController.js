const db = require("../config/db");

exports.showDashboard = (req, res) => {
    const sql = "SELECT * FROM users";

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Dashboard DB Error:", err);
            return res.send("Dashboard Database Error");
        }

        res.render("dashboard", {
            users: results
        });
    });
};