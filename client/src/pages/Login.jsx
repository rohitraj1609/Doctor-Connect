import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';

export default function Login() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/auth/login', { email, password });
      if (!data.success) {
        setError(data.message);
        return;
      }
      login(data.data.user, data.data.accessToken);
      navigate(data.data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-6">Sign in to your DocConnect account</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-3 text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register/patient" className="text-blue-600 hover:underline font-medium">
            Sign up as Patient
          </Link>
          {' or '}
          <Link to="/register/doctor" className="text-blue-600 hover:underline font-medium">
            as Doctor
          </Link>
        </div>
      </div>
    </div>
  );
}
