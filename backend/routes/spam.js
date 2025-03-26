const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { retrainModel } = require("../services/aiSpamClassifier");

// POST /api/spam/feedback
// Endpoint to receive user feedback on spam classification
router.post("/feedback", async (req, res) => {
  try {
    const { emailId, isActuallySpam, userId } = req.body;

    // Update the email classification in the database
    const updateQuery = `
      UPDATE emails 
      SET is_spam = $1, 
          user_feedback = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [isActuallySpam, emailId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Store feedback for model retraining
    const feedbackQuery = `
      INSERT INTO email_feedback (email_id, user_id, is_spam)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    await pool.query(feedbackQuery, [emailId, userId || null, isActuallySpam]);

    res.json({
      message: "Feedback recorded successfully",
      email: rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/spam/retrain
// Endpoint to trigger model retraining based on feedback
router.post("/retrain", async (req, res) => {
  try {
    // Get all emails with user feedback for retraining
    const { rows } = await pool.query(`
      SELECT * FROM emails 
      WHERE user_feedback = true
      ORDER BY updated_at DESC
      LIMIT 1000;
    `);

    if (rows.length < 10) {
      return res.status(400).json({
        error: "Not enough feedback data for retraining",
        required: 10,
        current: rows.length,
      });
    }

    // Call model retraining function
    const result = await retrainModel(rows);

    res.json({
      message: "Model retrained successfully",
      performance: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/spam/stats
// Get statistics about spam detection
router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_emails,
        SUM(CASE WHEN is_spam = true THEN 1 ELSE 0 END) as spam_count,
        SUM(CASE WHEN is_spam = false THEN 1 ELSE 0 END) as ham_count,
        AVG(spam_score) as avg_spam_score
      FROM emails;
    `);

    const senderStats = await pool.query(`
      SELECT 
        sender,
        COUNT(*) as email_count,
        SUM(CASE WHEN is_spam = true THEN 1 ELSE 0 END) as spam_count,
        ROUND(SUM(CASE WHEN is_spam = true THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as spam_percentage
      FROM emails
      GROUP BY sender
      ORDER BY spam_percentage DESC
      LIMIT 10;
    `);

    res.json({
      general: stats.rows[0],
      topSpamSenders: senderStats.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
