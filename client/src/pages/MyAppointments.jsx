import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch, apiPost } from '../services/api';

const TABS = [
  { key: '', label: 'All' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  scheduled: 'bg-green-100 text-green-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-gray-100 text-gray-700',
};

export default function MyAppointments() {
  const { user } = useAuth();
  const [tab, setTab] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const params = tab ? `?status=${tab}` : '';
    try {
      const data = await apiGet(`/appointments/my${params}`);
      if (data.success) setAppointments(data.data.appointments);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function handleCancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    setCancellingId(id);
    try {
      const data = await apiPatch(`/appointments/${id}/cancel`, { reason: 'Cancelled by user' });
      if (data.success) fetchAppointments();
    } catch { /* ignore */ } finally {
      setCancellingId(null);
    }
  }

  async function handleComplete(id) {
    const data = await apiPatch(`/appointments/${id}/complete`, {});
    if (data.success) fetchAppointments();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No appointments found</p>
          {user?.role === 'patient' && (
            <Link to="/doctors" className="text-blue-600 hover:underline mt-2 inline-block">Find a doctor</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => {
            const other = user?.role === 'patient' ? apt.doctorId : apt.patientId;
            const isActive = ['scheduled', 'rescheduled'].includes(apt.status);
            return (
              <div key={apt._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">
                        {other?.firstName?.[0]}{other?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800">
                        {user?.role === 'patient' ? `Dr. ${other?.firstName} ${other?.lastName}` : `${other?.firstName} ${other?.lastName}`}
                      </h3>
                      {user?.role === 'patient' && other?.specialization && (
                        <p className="text-sm text-blue-600">{other.specialization}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' at '}<span className="font-medium">{apt.startTime} - {apt.endTime}</span>
                      </p>
                      {apt.reason && <p className="text-sm text-gray-400 mt-1 truncate">Reason: {apt.reason}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {apt.status}
                    </span>
                    {apt.consultationId && (
                      <Link to={`/consultation/${apt.consultationId}`}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                        Open Chat
                      </Link>
                    )}
                    {isActive && (
                      <div className="flex gap-2">
                        {user?.role === 'patient' && (
                          <Link to={`/appointments/${apt._id}/reschedule`}
                            className="text-xs text-blue-600 hover:underline font-medium">
                            Reschedule
                          </Link>
                        )}
                        {user?.role === 'doctor' && (
                          <>
                            <button onClick={async () => {
                              const data = await apiPost('/consultations/start', { appointmentId: apt._id });
                              if (data.success) navigate(`/consultation/${data.data.consultation._id}`);
                            }} className="text-xs text-purple-600 hover:underline font-medium">
                              Start Chat
                            </button>
                            <button onClick={() => handleComplete(apt._id)}
                              className="text-xs text-green-600 hover:underline font-medium">
                              Complete
                            </button>
                          </>
                        )}
                        <button onClick={() => handleCancel(apt._id)} disabled={cancellingId === apt._id}
                          className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50">
                          {cancellingId === apt._id ? '...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
