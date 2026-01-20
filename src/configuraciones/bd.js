const mysql = require('mysql2');
const dotenv=require('dotenv')
dotenv.config({path:'.env'})



const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
}).promise();

module.exports = pool;