// app/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import { fetchSpamStats } from "../utils/api";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchSpamStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading statistics...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            <p>{error || "Failed to load dashboard data"}</p>
            <button
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const pieChartData = [
    { name: "Spam", value: stats.general.spam_count },
    {
      name: "Not Spam",
      value: stats.general.ham_count || stats.general.total_emails - stats.general.spam_count,
    },
  ];

  const COLORS = ["#ff6b6b", "#4dabf7"];

  const senderChartData = stats.topSpamSenders.map((sender) => ({
    name: sender.sender.split("@")[0], // Only show username part
    spamPercentage: parseFloat(sender.spam_percentage),
    emailCount: sender.email_count,
  }));

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Spam Analytics Dashboard</h1>
          <button
            onClick={() => router.push("/inbox")}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Back to Inbox
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Emails"
            value={stats.general.total_emails}
            color="bg-blue-500"
          />
          <StatCard
            title="Spam Detected"
            value={stats.general.spam_count}
            percentage={
              ((stats.general.spam_count / stats.general.total_emails) * 100).toFixed(1) + "%"
            }
            color="bg-red-500"
          />
          <StatCard
            title="Avg. Spam Score"
            value={(stats.general.avg_spam_score || 0).toFixed(2) + "%"}
            color="bg-yellow-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Spam vs Not Spam */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Email Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} emails`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Spam Senders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Spam Senders</h2>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <BarChart data={senderChartData}>
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="spamPercentage"
                    name="Spam %"
                    fill="#ff6b6b"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="emailCount"
                    name="Email Count"
                    fill="#4dabf7"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, percentage, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div
        className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-white mb-4`}>
        <span className="text-2xl font-bold">{value.toString().charAt(0)}</span>
      </div>
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {percentage && <p className="text-sm text-gray-500 mt-1">{percentage}</p>}
    </div>
  );
}
