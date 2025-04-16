// app/submit/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitEmail } from "../utils/api";

export default function SubmitEmailPage() {
  const [formData, setFormData] = useState({
    sender: "",
    recipient: "user@example.com",
    subject: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const data = await submitEmail(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to submit email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Submit Email for Classification</h1>
          <button
            onClick={() => router.push("/inbox")}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Back to Inbox
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sender">
              Sender Email
            </label>
            <input
              type="email"
              id="sender"
              name="sender"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.sender}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="recipient">
              Recipient Email
            </label>
            <input
              type="email"
              id="recipient"
              name="recipient"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.recipient}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="subject">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="content">
              Email Content
            </label>
            <textarea
              id="content"
              name="content"
              rows="6"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.content}
              onChange={handleChange}
              required></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {isSubmitting ? "Submitting..." : "Submit Email"}
            </button>
          </div>
        </form>

        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.is_spam
                ? "bg-red-100 border border-red-400"
                : "bg-green-100 border border-green-400"
            }`}>
            <h2 className="text-lg font-semibold mb-2">Classification Result</h2>
            <p className="mb-1">
              <span className="font-medium">Status:</span>
              {result.is_spam ? " Spam Detected" : " Not Spam"}
            </p>
            <p className="mb-1">
              <span className="font-medium">Spam Score:</span> {result.spam_score}%
            </p>
            <p className="mb-1">
              <span className="font-medium">Confidence:</span> {Math.round(result.confidence * 100)}
              %
            </p>
            <p className="mb-1">
              <span className="font-medium">Method:</span>{" "}
              {result.classification?.method || "Unknown"}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
