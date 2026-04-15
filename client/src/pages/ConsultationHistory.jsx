import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';

export default function ConsultationHistory() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await apiGet('/consultations/my');
      if (data.success) setConsultations(data.data.consultations);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Consultations</h1>

      {consultations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No consultations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map(c => {
            const other = user?.role === 'doctor' ? c.patientId : c.doctorId;
            const apt = c.appointmentId;
            return (
              <Link key={c._id} to={`/consultation/${c._id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">{other?.firstName?.[0]}{other?.lastName?.[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {user?.role === 'doctor' ? '' : 'Dr. '}{other?.firstName} {other?.lastName}
                      </h3>
                      {other?.specialization && <p className="text-sm text-blue-600">{other.specialization}</p>}
                      {apt && (
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(apt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          {' at '}{apt.startTime}
                          {apt.reason && <> &middot; {apt.reason}</>}
                        </p>
                      )}
                      {c.diagnosis && <p className="text-sm text-gray-400 mt-1">Diagnosis: {c.diagnosis}</p>}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
