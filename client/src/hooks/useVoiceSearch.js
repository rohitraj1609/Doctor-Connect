import { useState, useRef, useCallback, useEffect } from 'react';

const VOICE_API = 'http://localhost:5001';

export default function useVoiceSearch({ onResult } = {}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState('');
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const onResultRef = useRef(onResult);

  onResultRef.current = onResult;

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const processAudio = useCallback(async (audioBlob) => {
    setIsProcessing(true);
    setModelStatus('Transcribing...');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch(`${VOICE_API}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.text) {
        setTranscript(data.text);
        setModelStatus('');
        if (onResultRef.current) onResultRef.current(data.text);
      } else {
        setError(data.message || 'No speech detected. Try again.');
      }
    } catch (err) {
      console.error('Voice API error:', err);
      setError('Voice server not running. Start it with: python voice-server/voice_api.py');
    } finally {
      setIsProcessing(false);
      setModelStatus('');
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) await processAudio(blob);
      };

      mediaRecorder.start();
      setIsListening(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsListening(false);
        }
      }, 10000);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Allow mic in browser settings.');
      } else {
        setError('Could not access microphone.');
      }
    }
  }, [processAudio]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { transcript, isListening, isProcessing, modelStatus, isSupported, error, startListening, stopListening };
}
