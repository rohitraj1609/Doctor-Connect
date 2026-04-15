import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <Link
      to={`/doctors/${doctor._id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition block"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {doctor.profilePicUrl ? (
            <img src={doctor.profilePicUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <span className="text-blue-600 font-bold text-lg">
              {doctor.firstName?.[0]}{doctor.lastName?.[0]}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-800 truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
          {doctor.hospital && (
            <p className="text-sm text-gray-500 truncate">{doctor.hospital}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {doctor.experience > 0 && (
              <span>{doctor.experience} yrs exp</span>
            )}
            {doctor.rating > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {doctor.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {doctor.consultationFee > 0 && (
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-bold text-gray-800">&#8377;{doctor.consultationFee}</span>
            <p className="text-xs text-gray-400">per visit</p>
          </div>
        )}
      </div>
    </Link>
  );
}
