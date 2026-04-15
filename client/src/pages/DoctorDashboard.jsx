import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ todayCount: 0, weekCount: 0, totalPatients: 0 });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, aptData] = await Promise.all([
          apiGet('/doctors/me/stats'),
          apiGet('/appointments/my?status=scheduled&limit=10'),
        ]);
        if (statsData.success) setStats(statsData.data);
        if (aptData.success) setTodayAppointments(aptData.data.appointments);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStartChat(aptId) {
    const data = await apiPost('/consultations/start', { appointmentId: aptId });
    if (data.success) navigate(`/consultation/${data.data.consultation._id}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome, Dr. {user?.lastName}!
      </h1>
      <p className="text-gray-500 mb-8">Your practice at a glance</p>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{loading ? '-' : stats.todayCount}</p>
          <p className="text-sm text-gray-500 mt-1">Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '-' : stats.weekCount}</p>
          <p className="text-sm text-gray-500 mt-1">This Week</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{loading ? '-' : stats.totalPatients}</p>
          <p className="text-sm text-gray-500 mt-1">Total Patients</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/doctor/slots" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Manage Slots</h3>
        </Link>
        <Link to="/appointments" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">All Appointments</h3>
        </Link>
        <Link to="/consultations" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Consultations</h3>
        </Link>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
          <Link to="/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No upcoming appointments</p>
            <Link to="/doctor/slots" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Set your availability</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map(apt => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-xs">
                    {apt.patientId?.firstName?.[0]}{apt.patientId?.lastName?.[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm">{apt.patientId?.firstName} {apt.patientId?.lastName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.startTime}
                    {apt.reason && <> &middot; {apt.reason}</>}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleStartChat(apt._id)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition">
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
