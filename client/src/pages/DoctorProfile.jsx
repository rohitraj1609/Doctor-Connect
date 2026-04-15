import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../services/api';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/doctors/${id}`);
        if (data.success) setDoctor(data.data.doctor);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Doctor not found</p>
        <Link to="/doctors" className="text-blue-600 hover:underline mt-2 inline-block">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {doctor.profilePicUrl ? (
              <img src={doctor.profilePicUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-2xl">
                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
            {doctor.hospital && <p className="text-gray-500 mt-1">{doctor.hospital}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {doctor.experience > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {doctor.experience} years experience
                </span>
              )}
              {doctor.rating > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
                </span>
              )}
            </div>
          </div>
          {doctor.consultationFee > 0 && (
            <div className="text-right flex-shrink-0">
              <span className="text-2xl font-bold text-gray-800">&#8377;{doctor.consultationFee}</span>
              <p className="text-xs text-gray-400">per consultation</p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Bio */}
        {doctor.bio && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Qualifications */}
        {doctor.qualifications?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Qualifications</h2>
            <ul className="space-y-1.5">
              {doctor.qualifications.map((q, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact / Location */}
        {doctor.address?.city && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Location</h2>
            <p className="text-gray-600">
              {[doctor.address.street, doctor.address.city, doctor.address.state, doctor.address.zip].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Book Appointment CTA */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 text-center">
        <h2 className="font-semibold text-gray-800 mb-2">Book an Appointment</h2>
        <p className="text-gray-500 text-sm mb-4">Choose a convenient time slot</p>
        <Link
          to={`/book/${doctor._id}`}
          className="inline-block bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
