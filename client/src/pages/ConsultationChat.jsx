import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiGet, apiPatch } from '../services/api';

export default function ConsultationChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [endForm, setEndForm] = useState({ summary: '', prescription: '', diagnosis: '' });
  const [showEndForm, setShowEndForm] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load consultation + messages
  useEffect(() => {
    async function load() {
      const [cData, mData] = await Promise.all([
        apiGet(`/consultations/${id}`),
        apiGet(`/consultations/${id}/messages`),
      ]);
      if (cData.success) setConsultation(cData.data.consultation);
      if (mData.success) setMessages(mData.data.messages);
      setLoading(false);
    }
    load();
  }, [id]);

  // Join room
  useEffect(() => {
    if (!socket || !consultation) return;
    socket.emit('join-consultation', { consultationId: id });

    return () => {
      socket.emit('leave-consultation', { consultationId: id });
    };
  }, [socket, consultation, id]);

  // Listen for events
  useEffect(() => {
    if (!socket) return;

    function onNewMessage(msg) {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    }

    function onTyping() { setTyping(true); }
    function onStopTyping() { setTyping(false); }
    function onEnded(data) {
      setConsultation(prev => prev ? { ...prev, status: 'completed', ...data } : prev);
    }

    socket.on('new-message', onNewMessage);
    socket.on('user-typing', onTyping);
    socket.on('user-stopped-typing', onStopTyping);
    socket.on('consultation-ended', onEnded);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('user-typing', onTyping);
      socket.off('user-stopped-typing', onStopTyping);
      socket.off('consultation-ended', onEnded);
    };
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !socket?.connected) return;
    socket.emit('send-message', { consultationId: id, content: input.trim() });
    setInput('');
    socket.emit('typing-stop', { consultationId: id });
  }, [input, socket, id]);

  function handleInputChange(e) {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing-start', { consultationId: id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { consultationId: id });
    }, 2000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function handleEndConsultation() {
    setEnding(true);
    const data = await apiPatch(`/consultations/${id}/end`, endForm);
    if (data.success) {
      setConsultation(prev => prev ? { ...prev, status: 'completed' } : prev);
      setShowEndForm(false);
      if (socket) socket.emit('consultation-ended', { consultationId: id });
    }
    setEnding(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>;
  }

  if (!consultation) {
    return <div className="text-center py-16 text-gray-500">Consultation not found</div>;
  }

  const isCompleted = consultation.status === 'completed';
  const other = user?.role === 'doctor' ? consultation.patientId : consultation.doctorId;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">{other?.firstName?.[0]}{other?.lastName?.[0]}</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {user?.role === 'doctor' ? '' : 'Dr. '}{other?.firstName} {other?.lastName}
            </h2>
            <p className="text-xs text-gray-500">
              {isCompleted ? 'Consultation ended' : 'Active consultation'}
            </p>
          </div>
        </div>
        {user?.role === 'doctor' && !isCompleted && (
          <button onClick={() => setShowEndForm(true)}
            className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition">
            End Consultation
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          const isMine = String(msg.senderId) === String(user?._id);
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.type === 'system'
                  ? 'bg-gray-200 text-gray-500 text-center text-xs mx-auto'
                  : isMine
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* End Consultation Form (Doctor) */}
      {showEndForm && (
        <div className="bg-white border-t border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">End Consultation</h3>
          <textarea placeholder="Diagnosis" value={endForm.diagnosis} onChange={e => setEndForm({ ...endForm, diagnosis: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
          <textarea placeholder="Prescription" value={endForm.prescription} onChange={e => setEndForm({ ...endForm, prescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
          <textarea placeholder="Summary" value={endForm.summary} onChange={e => setEndForm({ ...endForm, summary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
          <div className="flex gap-2">
            <button onClick={handleEndConsultation} disabled={ending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {ending ? 'Ending...' : 'Confirm End'}
            </button>
            <button onClick={() => setShowEndForm(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Completed summary */}
      {isCompleted && consultation.summary && (
        <div className="bg-green-50 border-t border-green-200 p-4">
          <h3 className="font-semibold text-green-800 text-sm mb-1">Consultation Summary</h3>
          {consultation.diagnosis && <p className="text-sm text-gray-700"><strong>Diagnosis:</strong> {consultation.diagnosis}</p>}
          {consultation.prescription && <p className="text-sm text-gray-700"><strong>Prescription:</strong> {consultation.prescription}</p>}
          {consultation.summary && <p className="text-sm text-gray-700"><strong>Notes:</strong> {consultation.summary}</p>}
        </div>
      )}

      {/* Input */}
      {!isCompleted && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
