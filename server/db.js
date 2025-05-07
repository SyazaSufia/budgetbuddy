require('dotenv').config();
const mysql = require("mysql2/promise");

// Create a connection pool ONCE (for long-running environments like Render or traditional servers)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // more connections for a serverful environment
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true,
  // Add connection retry options
  connectTimeout: 60000, // longer timeout
  ssl: {
    rejectUnauthorized: true,
  },
});

// Add connection event listeners
pool.on('connection', (connection) => {
  console.log('DB Connection established');
});

pool.on('error', (err) => {
  console.error('Database error', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed. Attempting to reconnect...');
  }
});

// Update the query function in db.js
const query = async (sql, params) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Got database connection");
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Query error:", error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Database connection failed - check credentials and connectivity");
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
};

module.exports = {
  query
};
