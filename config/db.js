// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createPool({
    // host: "localhost",
    host: "103.206.246.227",
    // user: "root",
    user: "monty",
    password: "Demokrat@2024",
    // password: "",
    database: "db_karyawan",
    timezone: "Asia/Jakarta"
});

module.exports = connection;