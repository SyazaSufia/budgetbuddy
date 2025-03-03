require('dotenv').config();
const mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "srv1761.hstgr.io",
  user: "u858196522_budgetbuddy",
  password: "Dv7>74Xr]",
  database: "u858196522_budgetbuddy",
});

// Function to handle reconnection
function handleDisconnect() {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    } else {
      console.log("Connected to database");
      if (connection) connection.release();
    }
  });
}

handleDisconnect(); // Start the connection handling

module.exports = db;