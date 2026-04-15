import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPatch } from '../services/api';

export default function RescheduleAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState('');

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    async function load() {
      const data = await apiGet(`/appointments/${id}`);
      if (data.success) setAppointment(data.data.appointment);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!selectedDate || !appointment) return;
    async function loadSlots() {
      const doctorId = appointment.doctorId?._id || appointment.doctorId;
      const data = await apiGet(`/slots/doctor/${doctorId}/available?date=${selectedDate}`);
      if (data.success) setSlots(data.data.slots);
      setSelectedSlot(null);
    }
    loadSlots();
  }, [selectedDate, appointment]);

  useEffect(() => {
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
  }, []);

  async function handleReschedule() {
    if (!selectedSlot) return;
    setRescheduling(true);
    setError('');
    try {
      const data = await apiPatch(`/appointments/${id}/reschedule`, { newSlotId: selectedSlot._id });
      if (data.success) navigate('/appointments');
      else setError(data.message);
    } catch {
      setError('Reschedule failed');
    } finally {
      setRescheduling(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-gray-200 rounded-xl" /></div>;
  if (!appointment) return <div className="text-center py-16 text-gray-500">Appointment not found</div>;

  const doc = appointment.doctorId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reschedule Appointment</h1>
      <p className="text-gray-500 mb-6">
        Current: {new Date(appointment.date).toLocaleDateString('en-IN')} at {appointment.startTime}
        {doc?.firstName && ` with Dr. ${doc.firstName} ${doc.lastName}`}
      </p>

      {/* Date selector */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Select New Date</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map(d => {
            const dateObj = new Date(d + 'T00:00:00');
            return (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border min-w-[70px] transition ${
                  d === selectedDate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}>
                <span className="text-xs font-medium">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Select New Time</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No available slots for this date</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map(slot => (
              <button key={slot._id} onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                  selectedSlot?._id === slot._id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}>
                {slot.startTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      <button onClick={handleReschedule} disabled={!selectedSlot || rescheduling}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
        {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
      </button>
    </div>
  );
}
