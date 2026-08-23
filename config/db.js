const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345",
    database: "personal_finance"
});

connection.connect((err) => {
    if (err) {
        console.log("❌ MySQL Error:", err);
    } else {
        console.log("✅ MySQL Connected Successfully");
    }
});

module.exports = connection;