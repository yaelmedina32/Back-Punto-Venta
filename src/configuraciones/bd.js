const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.configure({path: 'src/.env'});

const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    port: process.env.port,
    database: process.env.database
}).promise();

module.exports = pool;