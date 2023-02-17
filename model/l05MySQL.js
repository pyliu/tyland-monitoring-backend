const path = require("path");
const config = require(path.join(__dirname, "config"));
const mysql = require('mysql2');
const pool = mysql.createPool({
    host:"127.0.0.1",
    user: config.l05.logMySQLUser,
    password: config.l05.logMySQLPw,
    database: config.l05.logMySQLDSN,
    waitForConnections: true,
    connectionLimit: 10, // 最大連線數
    queueLimit: 0
});
module.exports = pool.promise(); // 滙出 promise pool
