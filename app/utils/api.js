// app/utils/api.js

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Email Operations
export async function fetchEmails(filter = "", page = 1, limit = 50) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/emails?filter=${filter}&page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch emails");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function fetchEmailById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch email");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function submitEmail(emailData) {
  try {
    const response = await fetch(`${API_BASE_URL}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit email");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Spam Operations
export async function submitFeedback(emailId, isSpam, userId = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/spam/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailId,
        isActuallySpam: isSpam,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit feedback");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function fetchSpamStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/spam/stats`);

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
