// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createPool({
    // host: "localhost",
    // server fisik
    host: "103.206.246.227",
    user: "monty",
    // user: "root",
    password: "Demokrat@2024",
    // password: "",
    database: "db_karyawan",
    timezone: 'utc',
    // timezone: '+07:00',

});

module.exports = connection;