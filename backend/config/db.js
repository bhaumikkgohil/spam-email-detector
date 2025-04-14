// backend/config/db.js
// PostgreSQL connection setup using node-postgres (pg)

const { Pool } = require("pg");
const { PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE, PG_PORT } = require("./env");

const pool = new Pool({
  host: PG_HOST,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DATABASE,
  port: PG_PORT,
});

// Test connection
pool
  .connect()
  .then((client) => {
    console.log("Postgres connected");
    client.release();
  })
  .catch((err) => console.error("Postgres connection error:", err));

module.exports = pool;
