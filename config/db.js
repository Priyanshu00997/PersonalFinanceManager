const mysql = require("mysql2");

console.log("HOST =", process.env.DB_HOST);
console.log("PORT =", process.env.DB_PORT);
console.log("USER =", process.env.DB_USER);
console.log("PASSWORD =", process.env.DB_PASSWORD);
console.log("DATABASE =", process.env.DB_NAME);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.log("❌ MySQL Error:", err);
    } else {
        console.log("✅ MySQL Connected Successfully");
    }
});

module.exports = connection;