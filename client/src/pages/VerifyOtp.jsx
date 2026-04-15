import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'email';
  const target = searchParams.get('target') || '';
  const purpose = searchParams.get('purpose') || 'registration';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/auth/verify-otp', { target, type, code, purpose });
      if (!data.success) { setError(data.message); return; }
      setSuccess('Verified successfully!');
      if (type === 'email' && purpose === 'registration') {
        // Prompt phone verification next
        setTimeout(() => navigate(`/verify?type=phone&target=&purpose=registration`), 1500);
      } else {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      const data = await apiPost('/auth/send-otp', { target, type, purpose });
      if (!data.success) { setError(data.message); return; }
      setSuccess('OTP resent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={type === 'email'
                ? 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                : 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
              } />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify {type === 'email' ? 'Email' : 'Phone'}</h1>
        <p className="text-gray-500 mb-6">
          Enter the 6-digit code sent to <span className="font-medium text-gray-700">{target || 'your ' + type}</span>
        </p>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            className="w-full text-center text-3xl tracking-[0.5em] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            placeholder="------"
          />
          <button type="submit" disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button onClick={handleResend} disabled={resending}
          className="mt-4 text-blue-600 hover:underline text-sm font-medium disabled:opacity-50">
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
