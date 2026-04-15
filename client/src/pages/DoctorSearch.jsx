import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '../services/api';
import { SPECIALIZATIONS } from '../utils/constants';
import useVoiceSearch from '../hooks/useVoiceSearch';
import VoiceSearchButton from '../components/search/VoiceSearchButton';
import DoctorCard from '../components/search/DoctorCard';

export default function DoctorSearch() {
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchDoctors = useCallback(async (q = '', spec = '', page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (spec) params.set('specialization', spec);
      params.set('page', page);
      params.set('limit', 12);

      const data = await apiGet(`/search/doctors?${params}`);
      if (data.success) {
        setDoctors(data.data.doctors);
        setPagination(data.data.pagination);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Debounced search on query change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDoctors(query, specialization, 1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, specialization, fetchDoctors]);

  const handleVoiceResult = useCallback((text) => {
    setQuery(text);
  }, []);

  const { transcript, isListening, isProcessing, modelStatus, isSupported, error: voiceError, startListening, stopListening } = useVoiceSearch({
    onResult: handleVoiceResult,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Find a Doctor</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, specialization, hospital..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <VoiceSearchButton
          isListening={isListening}
          isProcessing={isProcessing}
          isSupported={isSupported}
          onClick={isListening ? stopListening : startListening}
        />
      </div>

      {/* Voice feedback */}
      {isListening && (
        <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording... Click mic again to stop
        </div>
      )}
      {isProcessing && (
        <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {modelStatus === 'ready' ? 'Transcribing...' : modelStatus || 'Loading voice model (first time only)...'}
        </div>
      )}
      {voiceError && (
        <div className="mb-4 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">{voiceError}</div>
      )}

      {/* Specialization filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSpecialization('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            !specialization ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
          }`}
        >
          All
        </button>
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialization(s === specialization ? '' : s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              s === specialization ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {loading ? 'Searching...' : `${pagination.total} doctor${pagination.total !== 1 ? 's' : ''} found`}
      </p>

      {/* Doctor grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No doctors found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchDoctors(query, specialization, p)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                p === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
