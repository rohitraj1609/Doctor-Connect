import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiGet, apiPost } from '../services/api';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadDoctor() {
      const data = await apiGet(`/doctors/${doctorId}`);
      if (data.success) setDoctor(data.data.doctor);
      setLoading(false);
    }
    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate) return;
    async function loadSlots() {
      const data = await apiGet(`/slots/doctor/${doctorId}/available?date=${selectedDate}`);
      if (data.success) setSlots(data.data.slots);
      setSelectedSlot(null);
    }
    loadSlots();
  }, [selectedDate, doctorId]);

  // Auto-select first date
  useEffect(() => {
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
  }, []);

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);
    setError('');
    try {
      const data = await apiPost('/appointments', { slotId: selectedSlot._id, reason });
      if (data.success) {
        navigate('/appointments');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-gray-200 rounded-xl" /></div>;
  }

  if (!doctor) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Doctor not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Doctor summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold text-lg">{doctor.firstName?.[0]}{doctor.lastName?.[0]}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Book with Dr. {doctor.firstName} {doctor.lastName}</h1>
          <p className="text-blue-600">{doctor.specialization}</p>
        </div>
      </div>

      {/* Date selector */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Select Date</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map(d => {
            const dateObj = new Date(d + 'T00:00:00');
            const isToday = d === dates[0];
            return (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border min-w-[70px] transition ${
                  d === selectedDate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}>
                <span className="text-xs font-medium">{isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                <span className="text-xs">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Select Time</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No available slots for this date</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map(slot => (
              <button key={slot._id} onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                  selectedSlot?._id === slot._id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}>
                {slot.startTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reason */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">Reason for Visit</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          rows={3} placeholder="Describe your symptoms or reason..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Confirm */}
      {selectedSlot && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Booking:</span>{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' at '}<span className="font-semibold text-blue-700">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
            {doctor.consultationFee > 0 && <> | Fee: <span className="font-semibold">&#8377;{doctor.consultationFee}</span></>}
          </p>
        </div>
      )}

      <button onClick={handleBook} disabled={!selectedSlot || booking}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
        {booking ? 'Booking...' : 'Confirm Booking'}
      </button>
    </div>
  );
}
