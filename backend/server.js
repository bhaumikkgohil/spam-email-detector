const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();

// Import API routes
const emailRoutes = require("./routes/emails");
const spamRoutes = require("./routes/spam");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Enable CORS for frontend
app.use(cors());

// Request logging
app.use(morgan("dev"));

// Middleware to parse JSON bodies (up to 10mb for large emails with attachments)
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// API Routing structure
app.use("/api/emails", emailRoutes);
app.use("/api/spam", spamRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Server error",
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing server");
  app.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
