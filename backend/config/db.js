// backend/config/db.js
// PostgreSQL connection setup using node-postgres (pg)

const { Pool } = require("pg");
const { config } = require("./env");

// Fix: Explicitly convert password to string
const pool = new Pool({
  host: config.PG_HOST,
  user: config.PG_USER,
  password: String(config.PG_PASSWORD), // Convert to string
  database: config.PG_DATABASE,
  port: parseInt(config.PG_PORT),
});

module.exports = pool;
