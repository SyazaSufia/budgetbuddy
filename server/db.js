require('dotenv').config();
const mysql = require("mysql2/promise");

// Use environment variables instead of hardcoded credentials
const dbConfig = {
  host: process.env.DB_HOST || "srv1761.hstgr.io",
  user: process.env.DB_USER || "u858196522_budgetbuddy",
  password: process.env.DB_PASSWORD || "Dv7>74Xr]",
  database: process.env.DB_NAME || "u858196522_budgetbuddy",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
};

// For serverless environments, create a new connection for each request
// instead of maintaining a pool
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Database connection established");
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

module.exports = {
  createConnection,
  query: async (sql, params) => {
    let connection;
    try {
      connection = await createConnection();
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }
};