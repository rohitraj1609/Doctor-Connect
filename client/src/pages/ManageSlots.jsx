import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '../services/api';

const DURATIONS = [15, 20, 30, 45, 60];

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ date: '', startTime: '09:00', endTime: '17:00', duration: 30 });
  const [message, setMessage] = useState('');

  // Get next 14 days of slots
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    try {
      const data = await apiGet(`/slots/my-slots?from=${from}&to=${to}`);
      if (data.success) setSlots(data.data.slots);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const data = await apiPost('/slots/bulk', form);
      if (data.success) {
        setMessage(`${data.data.inserted} slots created`);
        setTimeout(() => setMessage(''), 3000);
        fetchSlots();
        setForm({ ...form, date: '' });
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Error creating slots');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(slotId) {
    const data = await apiDelete(`/slots/${slotId}`);
    if (data.success) fetchSlots();
  }

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    const d = new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Time Slots</h1>

      {/* Create form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Create New Slots</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <button type="submit" disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {creating ? 'Creating...' : 'Create Slots'}
            </button>
            {message && <span className="ml-3 text-sm text-green-600">{message}</span>}
          </div>
        </form>
      </div>

      {/* Existing slots */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No slots created yet</p>
          <p className="text-sm mt-1">Use the form above to set your availability</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, daySlots]) => (
            <div key={date}>
              <h3 className="font-semibold text-gray-700 mb-3">{date}</h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map(slot => (
                  <div key={slot._id} className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
                    slot.status === 'available' ? 'bg-green-50 border-green-200 text-green-700' :
                    slot.status === 'booked' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    <span>{slot.startTime} - {slot.endTime}</span>
                    <span className="text-xs font-medium uppercase">{slot.status}</span>
                    {slot.status === 'available' && (
                      <button onClick={() => handleDelete(slot._id)}
                        className="text-red-400 hover:text-red-600 ml-1" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
