import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [aptData, conData] = await Promise.all([
          apiGet('/appointments/my?status=scheduled&limit=5'),
          apiGet('/consultations/my'),
        ]);
        if (aptData.success) setUpcoming(aptData.data.appointments);
        if (conData.success) setRecent(conData.data.consultations.slice(0, 3));
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome, {user?.firstName}!
      </h1>
      <p className="text-gray-500 mb-8">Manage your health from one place</p>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link to="/symptom-checker" className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 hover:border-green-400 transition text-center">
          <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Tell Problem</h3>
        </Link>
        <Link to="/doctors" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Find Doctor</h3>
        </Link>
        <Link to="/appointments" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Appointments</h3>
        </Link>
        <Link to="/consultations" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Consultations</h3>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No upcoming appointments</p>
              <Link to="/doctors" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Book one now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(apt => (
                <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">
                      {apt.doctorId?.firstName?.[0]}{apt.doctorId?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.startTime}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent consultations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Consultations</h2>
            <Link to="/consultations" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No consultations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(c => (
                <Link key={c._id} to={`/consultation/${c._id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition block">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-xs">
                      {c.doctorId?.firstName?.[0]}{c.doctorId?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm">Dr. {c.doctorId?.firstName} {c.doctorId?.lastName}</p>
                    <p className="text-xs text-gray-500">{c.diagnosis || c.summary || 'No summary'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
