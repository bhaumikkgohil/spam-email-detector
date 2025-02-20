"use client";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const emailData = {
  1: {
    from: "John Doe",
    to: "jane.smith@example.com",
    time: "Nov 5, 2023, 10:15 AM (GMT+2)",
    subject: "Project Collaboration",
    body: "Hello Jane, \n\nI hope this message finds you well. Let's discuss our upcoming project and potential collaboration. Let me know your available times. \n\nBest regards,\nJohn Doe",
    spam: "Flagged as spam due to suspicious links detected in the email content.",
  },
  2: {
    from: "Alice Brown",
    to: "michael.james@example.com",
    time: "Feb 12, 2025, 11:30 AM (GMT+1)",
    subject: "Meeting Confirmation",
    body: "Hi Michael, \n\nConfirming our meeting for next Monday at 10 AM. Looking forward to our discussion. \n\nBest,\nAlice",
    spam: null,
  },
  3: {
    from: "Marketing Team",
    to: "you@example.com",
    time: "Feb 12, 2025, 12:00 PM (GMT+1)",
    subject: "Exclusive Offer Inside!",
    body: "Dear Customer, \n\nGet 50% off on our latest products. Click the link below to claim your offer now. \n\n[Click Here] \n\nRegards,\nMarketing Team",
    spam: "Flagged as potential spam: contains promotional links.",
  },
  4: {
    from: "Samuel Lee",
    to: "emily.jones@example.com",
    time: "Feb 13, 2025, 1:15 PM (GMT+1)",
    subject: "Budget Meeting Notes",
    body: "Hi Emily, \n\nAttached are the notes from our budget meeting earlier today. Let me know if you have any questions. \n\nRegards,\nSamuel",
    spam: null,
  },
  5: {
    from: "Sophie Brown",
    to: "david.smith@example.com",
    time: "Feb 13, 2025, 2:00 PM (GMT+1)",
    subject: "IT System Update",
    body: "Hello David, \n\nThe IT system update will occur tomorrow at 3 PM. Please save your work before then. \n\nBest,\nSophie",
    spam: "Flagged as spam: contains IT system update link.",
  },
  6: {
    from: "Marketing Newsletter",
    to: "you@example.com",
    time: "Feb 14, 2025, 3:30 PM (GMT+1)",
    subject: "Valentine's Day Sale",
    body: "Dear Customer, \n\nCelebrate Valentine's Day with our special offers! Shop now and get 25% off on all items. \n\nRegards,\nMarketing Team",
    spam: "Flagged as potential spam: contains promotional links.",
  },
  7: {
    from: "Johnathan Green",
    to: "mark.brown@example.com",
    time: "Feb 14, 2025, 4:45 PM (GMT+1)",
    subject: "Client Follow-up",
    body: "Hi Mark, \n\nJust checking in to see how things are going with the client project. Let me know if there's anything I can assist with. \n\nBest regards, \nJohnathan",
    spam: null,
  },
  8: {
    from: "Lucy Adams",
    to: "helen.jones@example.com",
    time: "Feb 15, 2025, 9:00 AM (GMT+1)",
    subject: "Project Deadline Reminder",
    body: "Dear Helen, \n\nThis is a reminder that the project deadline is coming up this Friday. Please ensure everything is on track. \n\nThanks, \nLucy",
    spam: null,
  },
  9: {
    from: "David Young",
    to: "olivia.wilson@example.com",
    time: "Feb 15, 2025, 10:30 AM (GMT+1)",
    subject: "Business Proposal",
    body: "Hi Olivia, \n\nPlease find attached our proposal for the new business venture. Let me know your thoughts. \n\nBest, \nDavid",
    spam: null,
  },
  10: {
    from: "Lara Stevens",
    to: "paul.morris@example.com",
    time: "Feb 16, 2025, 11:00 AM (GMT+1)",
    subject: "Team Meeting Agenda",
    body: "Hi Paul, \n\nHere’s the agenda for our team meeting tomorrow. Please review and let me know if you have any additional points to add. \n\nBest, \nLara",
    spam: null,
  },
  11: {
    from: "Grace Roberts",
    to: "henry.baker@example.com",
    time: "Feb 16, 2025, 1:15 PM (GMT+1)",
    subject: "Upcoming Conference Details",
    body: "Hello Henry, \n\nJust wanted to share the details for the upcoming conference next week. Please confirm your attendance. \n\nBest, \nGrace",
    spam: null,
  },
  12: {
    from: "Frederick Evans",
    to: "sarah.johnson@example.com",
    time: "Feb 17, 2025, 2:30 PM (GMT+1)",
    subject: "Quarterly Report Review",
    body: "Hi Sarah, \n\nAttached is the quarterly report for your review. Please let me know if you have any questions. \n\nBest regards, \nFrederick",
    spam: null,
  },
};

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const email = emailData[id] || {};

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className=" mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{email.subject}</h1>
          <button
            onClick={() => router.push("/inbox")}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Back
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Email Details (Placed at the top) */}
          <div className="flex flex-row bg-gray-50 p-4 gap-4 rounded-lg shadow">
            <p>
              <strong>From:</strong> {email.from}
            </p>
            <p>
              <strong>To:</strong> {email.to}
            </p>
            <p className="text-sm text-gray-500">{email.time}</p>
          </div>

          {/* Email Content (Placed below) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <p className="whitespace-pre-line">{email.body}</p>
          </div>
        </div>

        {/* Spam Classification */}
        {email.spam && (
          <div className="mt-4 bg-gray-200 p-4 rounded-lg shadow">
            <h2 className="font-semibold">Spam Classification</h2>
            <p className="text-gray-600">{email.spam}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600">
            <AlertTriangle size={20} />
          </button>
          <button className="p-2 rounded bg-gray-600 text-white hover:bg-gray-700">
            <X size={20} />
          </button>
          <button className="p-2 rounded bg-red-600 text-white hover:bg-red-700">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}
