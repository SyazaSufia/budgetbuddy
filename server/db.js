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
  acquireTimeout: 60000
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

// Query helper using the shared pool
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};

module.exports = {
  query
};
