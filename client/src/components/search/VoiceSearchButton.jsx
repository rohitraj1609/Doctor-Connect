export default function VoiceSearchButton({ isListening, isProcessing, isSupported, onClick }) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isProcessing}
      className={`p-2.5 rounded-lg border transition-all relative ${
        isListening
          ? 'bg-red-100 border-red-400 text-red-600'
          : isProcessing
            ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
            : 'bg-white border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300'
      }`}
      title={isProcessing ? 'Processing...' : isListening ? 'Click to stop' : 'Click to speak'}
    >
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
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
  );
}
