
require("dotenv").config();

const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  pool: {
    max: 3
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config).connect();

module.exports = { sql, poolPromise };