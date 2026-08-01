'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  recipient: string;
  channel: string;
  subject?: string;
  content?: string;
  status: string;
  retryCount?: number;
}

const API_BASE_URL = 'http://localhost:8080/api/notifications';

export default function NotificationDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipient: '',
    channel: 'EMAIL',
    subject: '',
    content: '',
    idempotencyKey: ''
  });

  // GET: /api/notifications/logs
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        cache: 'no-store' // Avoid Next.js aggressive caching for polling
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setErrorMsg(null);
    } catch (error) {
      console.warn('Backend unavailable or network error:', error);
      setErrorMsg('Backend service unreachable. Retrying connection...');
    }
  };

  // Poll backend every 2.5s to display live Kafka retry & status updates
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2500);
    return () => clearInterval(interval);
  }, []);

  // POST: /api/notifications/dispatch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      idempotencyKey: formData.idempotencyKey || `IK-${Date.now()}`
    };

    try {
      const response = await fetch(`${API_BASE_URL}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({ recipient: '', channel: 'EMAIL', subject: '', content: '', idempotencyKey: '' });
        fetchNotifications();
      } else {
        alert(`Failed to dispatch notification. Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Network error while dispatching notification.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">✓ {status}</span>;
      case 'FAILED':
      case 'DLT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">✗ {status}</span>;
      case 'RETRYING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">⚠️ {status}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">⏳ {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="border-b pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notify Engine Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time Kafka Event Stream & Dynamic Retry Monitor</p>
          </div>
          {errorMsg && (
            <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200 font-medium">
              {errorMsg}
            </span>
          )}
        </header>

        {/* Trigger / Dispatch Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Dispatch Notification Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Recipient</label>
                <input
                  type="text"
                  placeholder="e.g. user@domain.com"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Channel</label>
                <select
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">PUSH</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subject</label>
              <input
                type="text"
                placeholder="Alert Subject"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Content</label>
              <textarea
                placeholder="Notification message body..."
                rows={3}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition duration-200 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Publishing to Kafka...' : 'Publish Event'}
            </button>
          </form>
        </div>

        {/* Live Status Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Live Notification Feed</h2>
            <span className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Kafka Sync Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Retries</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
<tbody className="divide-y divide-gray-100">
  {notifications.length === 0 ? (
    <tr key="empty-state">
      <td colSpan={6} className="text-center py-8 text-gray-400">
        No events in system. Dispatch one above!
      </td>
    </tr>
  ) : (
    notifications.map((n) => (
      <tr key={n.sid || n.idempotencyKey} className="hover:bg-gray-50/80 transition-colors">
        <td className="py-3.5 px-4 font-mono text-xs text-gray-500">#{n.sid}</td>
        <td className="py-3.5 px-4 font-medium text-gray-900">{n.recipient}</td>
        <td className="py-3.5 px-4">
          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {n.channel}
          </span>
        </td>
        <td className="py-3.5 px-4 truncate max-w-xs text-gray-700">{n.subject || '-'}</td>
        <td className="py-3.5 px-4 text-center font-mono text-xs">
          <span className={`px-2 py-0.5 rounded ${n.retryCount && n.retryCount > 0 ? 'bg-yellow-100 text-yellow-800 font-bold' : 'text-gray-400'}`}>
            {n.retryCount ?? 0}
          </span>
        </td>
        <td className="py-3.5 px-4">{getStatusBadge(n.status)}</td>
      </tr>
    ))
  )}
</tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}