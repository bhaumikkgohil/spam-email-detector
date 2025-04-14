const pool = require("../config/db");

// Create upgraded emails table with additional fields
const createTableQuery = `
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255),
    subject TEXT,
    headers JSONB,
    content TEXT NOT NULL,
    spam_score FLOAT DEFAULT 0,
    is_spam BOOLEAN DEFAULT false,
    confidence FLOAT DEFAULT 0,
    user_feedback BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_feedback (
    id SERIAL PRIMARY KEY,
    email_id INTEGER REFERENCES emails(id),
    user_id INTEGER,
    is_spam BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sender_reputation (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) UNIQUE,
    spam_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    reputation_score FLOAT DEFAULT 0.5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool
  .query(createTableQuery)
  .then(() => console.log("Email tables created or already exist"))
  .catch((err) => console.error("Error creating email tables:", err));

// Function to insert a new email record
const createEmail = async (emailData) => {
  const { sender, recipient, subject, headers, content, spamScore, isSpam, confidence } = emailData;

  // First, update sender reputation
  await updateSenderReputation(sender, isSpam);

  const query = `
    INSERT INTO emails (sender, recipient, subject, headers, content, spam_score, is_spam, confidence)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    sender,
    recipient || null,
    subject || null,
    headers || {},
    content,
    spamScore || 0,
    isSpam || false,
    confidence || 0,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Function to retrieve emails with enhanced filtering
const getEmails = async (options = {}) => {
  const { filter, limit = 50, offset = 0, sortBy = "created_at", sortOrder = "DESC" } = options;

  let query = `SELECT * FROM emails`;
  const queryParams = [];
  let whereClause = "";

  // Apply filters
  if (filter === "spam") {
    whereClause = " WHERE is_spam = true";
  } else if (filter === "non-spam") {
    whereClause = " WHERE is_spam = false";
  } else if (filter === "uncertain") {
    whereClause = " WHERE confidence < 0.7";
  } else if (filter === "recent") {
    whereClause = " WHERE created_at > NOW() - INTERVAL '24 hours'";
  }

  query += whereClause;

  // Apply sorting
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Apply pagination
  query += ` LIMIT $1 OFFSET $2`;
  queryParams.push(limit, offset);

  const { rows } = await pool.query(query, queryParams);
  return rows;
};

// Function to update sender reputation
const updateSenderReputation = async (sender, isSpam) => {
  // Use upsert pattern to create or update sender reputation
  const query = `
    INSERT INTO sender_reputation (sender, spam_count, total_count, reputation_score, last_updated)
    VALUES ($1, $2, 1, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (sender) 
    DO UPDATE SET 
      spam_count = sender_reputation.spam_count + $2,
      total_count = sender_reputation.total_count + 1,
      reputation_score = (sender_reputation.spam_count + $2)::float / (sender_reputation.total_count + 1),
      last_updated = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const spamIncrement = isSpam ? 1 : 0;
  const initialScore = isSpam ? 1.0 : 0.0;

  await pool.query(query, [sender, spamIncrement, initialScore]);
};

// Function to get sender reputation
const getSenderReputation = async (sender) => {
  const query = `
    SELECT * FROM sender_reputation
    WHERE sender = $1;
  `;

  const { rows } = await pool.query(query, [sender]);
  return rows[0] || { sender, reputation_score: 0.5 }; // Default neutral reputation
};

module.exports = {
  createEmail,
  getEmails,
  getSenderReputation,
  updateSenderReputation,
};
