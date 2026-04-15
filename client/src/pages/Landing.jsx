import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
              Your Health, <br />
              <span className="text-blue-200">One Click Away</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl">
              Book appointments with top doctors, consult online, and manage your health — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register/patient"
                    className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Get Started as Patient
                  </Link>
                  <Link
                    to="/register/doctor"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                  >
                    Join as Doctor
                  </Link>
                </>
              ) : (
                <Link
                  to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                  className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Find a Doctor',
                desc: 'Search by specialization, use voice search, and find the right doctor for you.',
                icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
              },
              {
                title: 'Book an Appointment',
                desc: 'Choose a convenient time slot and book your appointment instantly.',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
              {
                title: 'Consult Online',
                desc: 'Chat with your doctor in real-time. Describe symptoms and get expert advice.',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        DocConnect &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
