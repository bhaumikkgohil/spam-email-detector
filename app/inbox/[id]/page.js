// app/inbox/[id]/page.js
"use client";
import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchEmailById, submitFeedback } from "../../utils/api";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  useEffect(() => {
    async function loadEmail() {
      try {
        setLoading(true);
        const data = await fetchEmailById(id);
        setEmail(data);
      } catch (err) {
        console.error("Failed to load email:", err);
        setError("Failed to load email details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEmail();
    }
  }, [id]);

  const handleMarkAsSpam = async () => {
    try {
      setFeedbackStatus("submitting");
      await submitFeedback(id, true);
      setEmail((prev) => ({ ...prev, is_spam: true }));
      setFeedbackStatus("success");
    } catch (err) {
      console.error("Failed to mark as spam:", err);
      setFeedbackStatus("error");
    }
  };

  const handleMarkAsNotSpam = async () => {
    try {
      setFeedbackStatus("submitting");
      await submitFeedback(id, false);
      setEmail((prev) => ({ ...prev, is_spam: false }));
      setFeedbackStatus("success");
    } catch (err) {
      console.error("Failed to mark as not spam:", err);
      setFeedbackStatus("error");
    }
  };

  const handleDelete = () => {
    // In a complete implementation, you would call an API to delete
    // For now, just navigate back to inbox
    router.push("/inbox");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading email...</p>
      </main>
    );
  }

  if (error || !email) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-red-500">Error</h1>
            <button
              onClick={() => router.push("/inbox")}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Back to Inbox
            </button>
          </div>
          <p>{error || "Email not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{email.subject}</h1>
          <button
            onClick={() => router.push("/inbox")}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            Back
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-row bg-gray-50 p-4 gap-4 rounded-lg shadow">
            <p>
              <strong>From:</strong> {email.sender}
            </p>
            <p>
              <strong>To:</strong> {email.recipient || "you@example.com"}
            </p>
            <p className="text-sm text-gray-500">{new Date(email.created_at).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <p className="whitespace-pre-line">{email.content}</p>
          </div>
        </div>

        {/* Spam Classification */}
        <div className="mt-4 bg-gray-200 p-4 rounded-lg shadow">
          <h2 className="font-semibold">Spam Classification</h2>
          <p className="text-gray-600">
            {email.is_spam ? "This email was detected as spam" : "This email is not spam"}
          </p>
          <p className="text-gray-600">Confidence: {Math.round((email.confidence || 0) * 100)}%</p>
          <p className="text-gray-600">Spam Score: {Math.round(email.spam_score || 0)}%</p>
        </div>

        {/* Feedback Status */}
        {feedbackStatus === "success" && (
          <div className="mt-2 p-2 text-sm text-green-700 bg-green-100 rounded">
            Feedback submitted successfully
          </div>
        )}

        {feedbackStatus === "error" && (
          <div className="mt-2 p-2 text-sm text-red-700 bg-red-100 rounded">
            Failed to submit feedback
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleMarkAsSpam}
            disabled={feedbackStatus === "submitting"}
            className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
            title="Mark as Spam">
            <AlertTriangle size={20} />
          </button>
          <button
            onClick={handleMarkAsNotSpam}
            disabled={feedbackStatus === "submitting"}
            className="p-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            title="Mark as Not Spam">
            <Check size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
            title="Delete Email">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}
