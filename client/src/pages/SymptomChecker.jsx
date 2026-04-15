import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../services/api';
import { analyzeSymptoms, getGreeting } from '../utils/symptomAnalyzer';
import useVoiceSearch from '../hooks/useVoiceSearch';

export default function SymptomChecker() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestedDoctors, setSuggestedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const endRef = useRef(null);

  // Voice input
  const { isListening, isProcessing, isSupported, startListening, stopListening } = useVoiceSearch({
    onResult: (text) => setInput(prev => prev ? prev + ' ' + text : text),
  });

  // Greeting
  useEffect(() => {
    setMessages([{ role: 'assistant', text: getGreeting(), type: 'greeting' }]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedDoctors]);

  async function fetchDoctors(specialization) {
    setLoadingDoctors(true);
    try {
      const data = await apiGet(`/search/doctors?specialization=${encodeURIComponent(specialization)}&limit=4`);
      if (data.success) setSuggestedDoctors(data.data.doctors);
    } catch { /* ignore */ } finally {
      setLoadingDoctors(false);
    }
  }

  // Track last diagnosis for context
  function getLastDiagnosis() {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.data?.found && msg.data?.primarySpecialization) {
        return {
          specialization: msg.data.primarySpecialization,
          conditions: msg.data.conditions,
        };
      }
    }
    return null;
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setSuggestedDoctors([]);

    // Analyze with conversation context
    setTimeout(() => {
      const previousDiagnosis = getLastDiagnosis();
      const result = analyzeSymptoms(text, previousDiagnosis);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: result.message,
        type: result.found ? 'diagnosis' : 'clarify',
        data: result,
      }]);

      if (result.found && result.primarySpecialization) {
        fetchDoctors(result.primarySpecialization);
      }
    }, 500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderMarkdown(text) {
    // Safe rendering — no dangerouslySetInnerHTML
    const parts = [];
    let key = 0;
    for (const line of text.split('\n')) {
      if (parts.length > 0) parts.push(<br key={`br-${key++}`} />);
      const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      for (const token of tokens) {
        if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('*') && token.endsWith('*')) {
          parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
        } else {
          parts.push(<span key={key++}>{token}</span>);
        }
      }
    }
    return parts;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">Health Assistant</h1>
            <p className="text-xs text-gray-500">Describe symptoms, get doctor recommendations</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : msg.type === 'diagnosis'
                  ? 'bg-green-50 border border-green-200 text-gray-800 rounded-bl-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
            }`}>
              <div>{renderMarkdown(msg.text)}</div>

              {/* Show condition badges for diagnosis */}
              {msg.data?.found && msg.data.conditions && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {msg.data.conditions.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Suggested doctors */}
        {loadingDoctors && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500">
              Finding available doctors...
            </div>
          </div>
        )}

        {suggestedDoctors.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-white border border-blue-200 rounded-2xl rounded-bl-md px-4 py-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Recommended Doctors:</p>
              <div className="space-y-3">
                {suggestedDoctors.map(doc => (
                  <Link key={doc._id} to={`/doctors/${doc._id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition block">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{doc.firstName?.[0]}{doc.lastName?.[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm">Dr. {doc.firstName} {doc.lastName}</p>
                      <p className="text-xs text-gray-500">{doc.specialization} &middot; {doc.experience} yrs &middot; &#8377;{doc.consultationFee}</p>
                    </div>
                    {doc.rating > 0 && (
                      <span className="text-xs text-yellow-600 font-medium flex-shrink-0">
                        &#9733; {doc.rating.toFixed(1)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <Link to="/doctors" className="block text-center text-sm text-blue-600 hover:underline mt-3 font-medium">
                View all doctors
              </Link>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`p-2.5 rounded-full border transition flex-shrink-0 ${
              isListening
                ? 'bg-red-100 border-red-400 text-red-600'
                : isProcessing
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:text-blue-600'
            }`}
            title={isListening ? 'Stop' : isProcessing ? 'Processing...' : 'Speak'}
          >
            {isListening && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
            {isProcessing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your symptoms..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button onClick={handleSend} disabled={!input.trim()}
          className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
