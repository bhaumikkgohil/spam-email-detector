const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { getSenderReputation } = require("../models/emailModel");
const { config } = require("../config/env");

// Fix the path reference issue
const MODEL_SAVE_PATH = path.resolve(
  __dirname,
  "..",
  config.MODEL_SAVE_PATH || "../models/spam_classifier.pkl"
);
const TRAINING_DATA_PATH = path.resolve(
  __dirname,
  "..",
  config.TRAINING_DATA_PATH || "../data/training_emails.json"
);

// Create directories if they don't exist
const modelDir = path.dirname(MODEL_SAVE_PATH);
const dataDir = path.dirname(TRAINING_DATA_PATH);

if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fallback to rule-based classifier if model isn't available
const ruleBasedClassifier = require("./spamClassifier");

// Flag to check if model is ready
let modelReady = false;

// Simple cache to avoid reloading model for each classification
let modelLastLoaded = 0;
const MODEL_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Classifies an email using the AI model
 * Falls back to rule-based classification if model unavailable
 */
async function classifyEmail(emailData) {
  try {
    const { content, sender } = emailData;

    // First check sender reputation
    const reputation = await getSenderReputation(sender);

    // If sender has very poor reputation, classify as spam without ML
    if (reputation.reputation_score > 0.9 && reputation.total_count > 5) {
      return {
        isSpam: true,
        spamScore: 0.95,
        confidence: 0.95,
        method: "reputation",
      };
    }

    // Check if model exists and is ready
    if (!modelReady || !fs.existsSync(MODEL_SAVE_PATH)) {
      // Fall back to rule-based classification
      const ruleResult = ruleBasedClassifier.classify(content);
      return {
        ...ruleResult,
        confidence: ruleResult.isSpam ? 0.7 : 0.6,
        method: "rule-based",
      };
    }

    // This is where you call the Python script
    const pythonProcess = spawn("python", [
      "ml/train_model.py",
      "predict",
      MODEL_SAVE_PATH,
      emailData.content,
    ]);

    // Get the output from Python
    return new Promise((resolve, reject) => {
      let result = "";
      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}`));
        }

        try {
          const prediction = JSON.parse(result);
          resolve({
            isSpam: prediction.is_spam,
            spamScore: prediction.spam_score,
            confidence: prediction.confidence,
            method: "ai-model",
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error in AI classification:", error);
    // Fall back to rule-based classification on error
    const ruleResult = ruleBasedClassifier.classify(emailData.content);
    return {
      ...ruleResult,
      confidence: 0.5,
      method: "rule-based-fallback",
    };
  }
}

/**
 * Extract features from email content for spam detection
 */
function extractFeatures(content) {
  return {
    hasUrls:
      content.includes("http://") || content.includes("https://") || content.includes("www."),
    hasExclamations: (content.match(/!/g) || []).length,
    hasMoneySymbols: content.includes("$") || content.includes("€") || content.includes("£"),
    capitalizedWordCount: (content.match(/\b[A-Z]{2,}\b/g) || []).length,
    urgencyWords:
      /urgent|immediately|act now|limited time|offer expires|don't wait|today only/i.test(content),
  };
}

/**
 * Train or retrain the AI model using collected data
 */
async function retrainModel(trainingData) {
  try {
    // Save training data to JSON file for Python script
    fs.writeFileSync(TRAINING_DATA_PATH, JSON.stringify(trainingData, null, 2));

    // In a real implementation, you would:
    // 1. Spawn a Python process to train the model
    // 2. Wait for training to complete
    // 3. Update the model file

    // Simulate model training
    console.log(`Training spam classifier with ${trainingData.length} examples`);

    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a dummy model file to indicate training completed
        fs.writeFileSync(
          MODEL_SAVE_PATH,
          JSON.stringify({
            modelType: "NaiveBayes",
            features: ["content_length", "contains_url", "capital_ratio"],
            trained_at: new Date().toISOString(),
            samples: trainingData.length,
          })
        );

        modelReady = true;

        resolve({
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.94,
          f1Score: 0.91,
          trainingSize: trainingData.length,
        });
      }, 2000);
    });
  } catch (error) {
    console.error("Error training model:", error);
    throw new Error("Failed to train spam classification model");
  }
}

/**
 * Run batch classification for multiple emails
 */
async function batchClassify(emails) {
  try {
    // Process emails in parallel for efficiency
    const results = await Promise.all(emails.map((email) => classifyEmail(email)));

    return results;
  } catch (error) {
    console.error("Error in batch classification:", error);
    throw error;
  }
}

// Initialize by checking if model exists
fs.access(MODEL_SAVE_PATH, fs.constants.F_OK, (err) => {
  if (!err) {
    console.log("AI spam classification model found");
    modelReady = true;
  } else {
    console.log("No spam classification model found, will use rule-based classification initially");
  }
});

module.exports = {
  classifyEmail,
  retrainModel,
  batchClassify,
};
