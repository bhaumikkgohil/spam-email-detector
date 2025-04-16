require("dotenv").config();

const config = {
  PG_HOST: process.env.PG_HOST || "localhost",
  PG_USER: process.env.PG_USER || "postgres",
  PG_PASSWORD: process.env.PG_PASSWORD || "1234",
  PG_DATABASE: process.env.PG_DATABASE || "postgres",
  PG_PORT: process.env.PG_PORT || 5432,
  PORT: process.env.PORT || 3001,

  // Add the ML model configurations
  MODEL_SAVE_PATH: process.env.MODEL_SAVE_PATH || "./models/spam_classifier.pkl",
  TRAINING_DATA_PATH: process.env.TRAINING_DATA_PATH || "./data/training_emails.json",
  FEEDBACK_DATA_PATH: process.env.FEEDBACK_DATA_PATH || "./data/feedback_emails.json",
};

module.exports = { config };
