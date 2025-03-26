require("dotenv").config();

module.exports = {
  PG_HOST: process.env.PG_HOST || "localhost",
  PG_USER: process.env.PG_USER || "postgres",
  PG_PASSWORD: process.env.PG_PASSWORD || "1234", // Update with your password
  PG_DATABASE: process.env.PG_DATABASE || "postgres",
  PG_PORT: process.env.PG_PORT || 5432,
  PORT: process.env.PORT || 3000,
};
