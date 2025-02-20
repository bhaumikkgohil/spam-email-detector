"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Mail, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialEmails = [
  {
    id: 1,
    name: "John Doe",
    type: "Sender",
    time: "Nov 5, 2023, 10:15 AM (GMT+2)",
    status: "not-spam",
    location: "",
  },
  {
    id: 2,
    name: "Alice Brown",
    location: "Unknown",
    time: "Feb 12, 2025, 11:30 AM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 3,
    name: "Marketing Team",
    type: "Spam Classification",
    time: "Feb 12, 2025, 12:00 PM (GMT+1)",
    status: "potential-spam",
  },
  {
    id: 4,
    name: "Samuel Lee",
    location: "Unknown",
    time: "Feb 13, 2025, 1:15 PM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 5,
    name: "Sophie Brown",
    type: "IT Helpdesk Support",
    time: "Feb 13, 2025, 2:00 PM (GMT+1)",
    status: "spam",
  },
  {
    id: 6,
    name: "Marketing Newsletter",
    location: "Unknown",
    time: "Feb 14, 2025, 3:30 PM (GMT+1)",
    status: "potential-spam",
  },
  {
    id: 7,
    name: "Johnathan Green",
    location: "Unknown",
    time: "Feb 14, 2025, 4:45 PM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 8,
    name: "Lucy Adams",
    location: "Unknown",
    time: "Feb 15, 2025, 9:00 AM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 9,
    name: "David Young",
    location: "Unknown",
    time: "Feb 15, 2025, 10:30 AM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 10,
    name: "Lara Stevens",
    location: "Unknown",
    time: "Feb 16, 2025, 11:00 AM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 11,
    name: "Grace Roberts",
    location: "Unknown",
    time: "Feb 16, 2025, 1:15 PM (GMT+1)",
    status: "not-spam",
  },
  {
    id: 12,
    name: "Frederick Evans",
    location: "Unknown",
    time: "Feb 17, 2025, 2:30 PM (GMT+1)",
    status: "not-spam",
  },
];

export default function Page() {
  const [emails, setEmails] = useState(initialEmails);
  const [visibleEmails, setVisibleEmails] = useState(initialEmails.slice(0, 6)); // Initial emails to show
  const [allEmailsLoaded, setAllEmailsLoaded] = useState(false); // Track if all emails are loaded
  const router = useRouter();

  const handleDelete = (id) => {
    setEmails(emails.filter((email) => email.id !== id));
    setVisibleEmails(visibleEmails.filter((email) => email.id !== id));
  };

  const handleLoadMore = () => {
    const nextEmails = emails.slice(
      visibleEmails.length,
      visibleEmails.length + 3
    ); // Load 3 more emails
    // If there are no more emails to load, set allEmailsLoaded to true
    if (visibleEmails.length + nextEmails.length >= emails.length) {
      setAllEmailsLoaded(true);
    }

    setVisibleEmails([...visibleEmails, ...nextEmails]);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <main className=" bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <input
          type="search"
          placeholder="Search emails..."
          className="w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Spam Legend */}
      <div className="flex space-x-4 text-sm mb-4">
        <div className="flex items-center text-green-500">
          <Check size={16} className="mr-1" /> Not Spam
        </div>
        <div className="flex items-center text-yellow-500">
          <AlertTriangle size={16} className="mr-1" /> Potential Spam
        </div>
        <div className="flex items-center text-red-500">
          <X size={16} className="mr-1" /> Spam
        </div>
      </div>

      <div className="space-y-4">
        {visibleEmails.map((email) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Mail size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">{email.name}</h3>
                <p className="text-sm text-gray-500">
                  {email.location || email.type}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{email.time}</span>
              {email.status === "spam" && (
                <X size={20} className="text-red-500" />
              )}
              {email.status === "potential-spam" && (
                <AlertTriangle size={20} className="text-yellow-500" />
              )}
              {email.status === "not-spam" && (
                <Check size={20} className="text-green-500" />
              )}

              <button
                onClick={() => router.push(`/inbox/${email.id}`)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Open
              </button>

              <button
                onClick={() => handleDelete(email.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-6">
        <button
          onClick={allEmailsLoaded ? () => {} : handleLoadMore} // If all emails are loaded, do nothing
          className={`px-6 py-2 rounded-lg transition-colors ${
            allEmailsLoaded
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {allEmailsLoaded ? "All emails displayed" : "Load More"}
        </button>
      </div>
    </main>
  );
}
