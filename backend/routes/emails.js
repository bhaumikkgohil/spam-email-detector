const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Add this line
const { createEmail, getEmails } = require("../models/emailModel");
const ruleBasedClassifier = require("../services/spamClassifier");
const aiClassifier = require("../services/aiSpamClassifier");

// POST /api/emails
// Accepts email data, classifies spam using AI model, and stores it in the database.
router.post("/", async (req, res) => {
  try {
    const { sender, recipient, subject, headers, content } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: "Sender and content are required" });
    }

    // Use the AI classifier to get spam score and flag
    const { isSpam, spamScore, confidence, method } = await aiClassifier.classifyEmail({
      sender,
      content,
    });

    // Create and save new email record in database
    const email = await createEmail({
      sender,
      recipient,
      subject,
      headers,
      content,
      spamScore,
      isSpam,
      confidence,
    });

    res.status(201).json({
      ...email,
      classification: {
        method,
        confidence,
      },
    });
  } catch (error) {
    console.error("Error processing email:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/emails
// Retrieves stored emails with enhanced filtering options
router.get("/", async (req, res) => {
  try {
    const { filter, limit = 50, page = 1, sortBy = "created_at", sortOrder = "DESC" } = req.query;

    const offset = (page - 1) * limit;

    const emails = await getEmails({
      filter,
      limit: parseInt(limit),
      offset,
      sortBy,
      sortOrder,
    });

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM emails
      ${
        filter === "spam"
          ? "WHERE is_spam = true"
          : filter === "non-spam"
          ? "WHERE is_spam = false"
          : ""
      }
    `;

    const { rows } = await pool.query(countQuery);
    const totalCount = parseInt(rows[0].count);

    res.json({
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error retrieving emails:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/emails/:id
// Retrieve a specific email by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM emails WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/emails/batch
// Process multiple emails at once
router.post("/batch", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "No emails provided for batch processing" });
    }

    // Use batch classification for efficiency
    const classificationResults = await aiClassifier.batchClassify(emails);

    // Store all emails with their classification results
    const savedEmails = await Promise.all(
      emails.map(async (email, index) => {
        const result = classificationResults[index];
        return createEmail({
          ...email,
          spamScore: result.spamScore,
          isSpam: result.isSpam,
          confidence: result.confidence,
        });
      })
    );

    res.status(201).json({
      message: `Processed ${savedEmails.length} emails`,
      emails: savedEmails,
    });
  } catch (error) {
    console.error("Error in batch processing:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
