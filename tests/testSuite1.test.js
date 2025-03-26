const request = require("supertest");
const app = require("../server");
const pool = require("../config/db");

// Sample test emails
const testEmails = [
  {
    sender: "test@example.com",
    recipient: "user@example.com",
    subject: "Hello World",
    content: "This is a legitimate test email",
  },
  {
    sender: "spam@example.com",
    recipient: "user@example.com",
    subject: "URGENT: You won a prize!",
    content: "Congratulations! You have won a prize of $1,000,000. Click here to claim now!",
  },
];

beforeAll(async () => {
  // Clear test data before running tests
  await pool.query("DELETE FROM emails WHERE sender LIKE '%@example.com'");
});

afterAll(async () => {
  // Close database connection after tests
  await pool.end();
});

describe("Email API Endpoints", () => {
  test("POST /api/emails should create a new email", async () => {
    const res = await request(app).post("/api/emails").send(testEmails[0]);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.sender).toEqual(testEmails[0].sender);
    expect(res.body.is_spam).toEqual(false);
  });

  test("POST /api/emails should detect spam", async () => {
    const res = await request(app).post("/api/emails").send(testEmails[1]);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.is_spam).toEqual(true);
    expect(res.body.spam_score).toBeGreaterThan(50);
  });

  test("GET /api/emails should return emails", async () => {
    const res = await request(app).get("/api/emails");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test("GET /api/emails?filter=spam should return only spam", async () => {
    const res = await request(app).get("/api/emails?filter=spam");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBeTruthy();

    // All returned emails should be marked as spam
    const allSpam = res.body.data.every((email) => email.is_spam === true);
    expect(allSpam).toBeTruthy();
  });
});

describe("Spam API Endpoints", () => {
  test("POST /api/spam/feedback should update email classification", async () => {
    // First, get an email ID
    const emailsRes = await request(app).get("/api/emails");
    const emailId = emailsRes.body.data[0].id;

    const res = await request(app).post("/api/spam/feedback").send({
      emailId,
      isActuallySpam: true,
      userId: 1,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.email.is_spam).toEqual(true);
  });

  test("GET /api/spam/stats should return statistics", async () => {
    const res = await request(app).get("/api/spam/stats");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("general");
    expect(res.body).toHaveProperty("topSpamSenders");
  });
});
