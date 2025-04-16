// app/inbox/page.js
"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Mail, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchEmails } from "../utils/api";

export default function Page() {
  const [emails, setEmails] = useState([]);
  const [visibleEmails, setVisibleEmails] = useState([]);
  const [allEmailsLoaded, setAllEmailsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const router = useRouter();

  // Load emails when component mounts or filter changes
  useEffect(() => {
    loadEmails();
  }, [filter, currentPage]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await fetchEmails(filter, currentPage);

      // Map API response to component state
      const formattedEmails = response.data.map((email) => ({
        id: email.id,
        name: email.sender,
        type: email.subject,
        time: new Date(email.created_at).toLocaleString(),
        status: email.is_spam ? "spam" : email.confidence < 0.7 ? "potential-spam" : "not-spam",
      }));

      // If this is page 1, reset emails; otherwise, append
      if (currentPage === 1) {
        setEmails(formattedEmails);
        setVisibleEmails(formattedEmails.slice(0, 6));
      } else {
        setEmails((prev) => [...prev, ...formattedEmails]);
        setVisibleEmails((prev) => [...prev, ...formattedEmails.slice(0, 6)]);
      }

      // Check if we've reached the last page
      if (formattedEmails.length === 0 || currentPage >= response.pagination?.totalPages) {
        setAllEmailsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load emails:", err);
      setError("Failed to load emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // In a full implementation, you would call an API to delete the email
    // For now, just update the UI
    setEmails(emails.filter((email) => email.id !== id));
    setVisibleEmails(visibleEmails.filter((email) => email.id !== id));
  };

  const handleLoadMore = () => {
    const nextEmails = emails.slice(visibleEmails.length, visibleEmails.length + 3);

    if (visibleEmails.length + nextEmails.length >= emails.length) {
      // If we've displayed all locally available emails,
      // try to load the next page from the API
      if (!allEmailsLoaded) {
        setCurrentPage(currentPage + 1);
      } else {
        setAllEmailsLoaded(true);
      }
    }

    setVisibleEmails([...visibleEmails, ...nextEmails]);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setAllEmailsLoaded(false);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <main className="bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">All Emails</option>
            <option value="spam">Spam Only</option>
            <option value="non-spam">Non-Spam Only</option>
          </select>
          <input
            type="search"
            placeholder="Search emails..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Logout
        </button>
      </div>

      {/* Spam Legend */}
      <div className="flex space-x-4 text-sm mb-4">
        <div className="flex items-center text-green-500">
          <Check
            size={16}
            className="mr-1"
          />{" "}
          Not Spam
        </div>
        <div className="flex items-center text-yellow-500">
          <AlertTriangle
            size={16}
            className="mr-1"
          />{" "}
          Potential Spam
        </div>
        <div className="flex items-center text-red-500">
          <X
            size={16}
            className="mr-1"
          />{" "}
          Spam
        </div>
      </div>

      {/* Loading State */}
      {loading && currentPage === 1 && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">Loading emails...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            className="underline ml-2"
            onClick={loadEmails}>
            Try again
          </button>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-4">
        {visibleEmails.map((email) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 bg-white">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Mail
                  size={20}
                  className="text-gray-600"
                />
              </div>
              <div>
                <h3 className="font-medium">{email.name}</h3>
                <p className="text-sm text-gray-500">{email.type}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{email.time}</span>
              {email.status === "spam" && (
                <X
                  size={20}
                  className="text-red-500"
                />
              )}
              {email.status === "potential-spam" && (
                <AlertTriangle
                  size={20}
                  className="text-yellow-500"
                />
              )}
              {email.status === "not-spam" && (
                <Check
                  size={20}
                  className="text-green-500"
                />
              )}

              <button
                onClick={() => router.push(`/inbox/${email.id}`)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Open
              </button>

              <button
                onClick={() => handleDelete(email.id)}
                className="text-gray-400 hover:text-gray-600">
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && visibleEmails.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <Mail
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <p className="text-gray-500">No emails found</p>
        </div>
      )}

      {/* Load More Button */}
      {visibleEmails.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={allEmailsLoaded && visibleEmails.length === emails.length}
            className={`px-6 py-2 rounded-lg transition-colors ${
              allEmailsLoaded && visibleEmails.length === emails.length
                ? "bg-gray-500 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}>
            {loading && currentPage > 1
              ? "Loading..."
              : allEmailsLoaded && visibleEmails.length === emails.length
              ? "All emails displayed"
              : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
}
