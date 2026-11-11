
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

/* =========================================================
   LOAD ENVIRONMENT VARIABLES
========================================================= */

dotenv.config({
  path: path.join(__dirname, ".env"),
});

dotenv.config({
  path: path.join(__dirname, ".env.local"),
  override: true,
});

/* =========================================================
   CHECK DATABASE CONFIGURATION
========================================================= */

const requiredVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing database environment variables: ${missingVariables.join(", ")}`
  );
}

const port = Number(process.env.DB_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be an integer between 1 and 65535.");
}

/* =========================================================
   CREATE MYSQL CONNECTION POOL
========================================================= */

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {},

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,
});

/* =========================================================
   TEST MYSQL CONNECTION
========================================================= */

async function testConnection() {
  try {
    const connection = await db.getConnection();

    try {
      const [rows] = await connection.query(
        "SELECT DATABASE() AS databaseName"
      );

      console.log("TiDB connection successful.");
      console.log(
        "Connected database:",
        rows[0].databaseName
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("TiDB connection failed.");
    console.error("Error code:", error.code || "UNKNOWN");
    console.error("Error message:", error.message);
    throw error;
  }
}

/* =========================================================
   EXPORT DATABASE CONNECTION
========================================================= */

db.testConnection = testConnection;

module.exports = db;
