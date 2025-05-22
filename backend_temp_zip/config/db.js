const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env file

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0
});

// Function to test the connection
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    // Exit the process if the database connection fails on startup
    process.exit(1);
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
}

// Test the connection when the module loads
// We call it here to ensure the app fails fast if DB connection is wrong
testConnection();

// Export the pool to be used in other parts of the application
module.exports = pool; 