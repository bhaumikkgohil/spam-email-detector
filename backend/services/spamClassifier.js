// backend/services/spamClassifier.js
// Basic spam classification using keyword filtering

// Hardcoded list of spam keywords
const spamKeywords = ["prize", "winner", "urgent"];

function classify(content) {
  let spamScore = 0;
  // Convert content to lowercase and split into words
  const words = content.toLowerCase().split(/\W+/);
  spamKeywords.forEach((keyword) => {
    // Count occurrences of each keyword in the email content
    const count = words.filter((word) => word === keyword).length;
    spamScore += count;
  });
  // Mark email as spam if at least one spam keyword is found
  const isSpam = spamScore > 0;
  return { spamScore, isSpam };
}

module.exports = { classify };
