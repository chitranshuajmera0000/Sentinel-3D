import { useState, useRef, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useCamera() {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState(null); // 'webcam' | 'screen' | null
  const streamRef = useRef(null);

  const stopCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setMode(null);


  }, []);

  const handleStreamEnd = useCallback(() => {
    console.warn('Stream ended unexpectedly');
    stopCamera();
    // Auto-restart could be implemented here, but typically if user stops sharing, it just stops.
  }, [stopCamera]);

  const startCamera = useCallback(async (newMode) => {
    try {
      if (isActive) {
        await stopCamera();
      }

      // Reset backend buffer when starting a new session
      try {
        await fetch(`${API_URL}/reset`, { 
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
      } catch (err) {
        console.error('Failed to reset backend buffer:', err);
      }

      let stream;
      if (newMode === 'webcam') {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      } else if (newMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Listen for track ended event (e.g. user stops sharing screen via browser UI)
        stream.getVideoTracks()[0].addEventListener('ended', handleStreamEnd);

        setIsActive(true);
        setMode(newMode);
      }
    } catch (err) {
      console.error('Error starting camera/screen:', err);
      // Let caller handle error if needed
      throw err;
    }
  }, [isActive, stopCamera, handleStreamEnd]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    startCamera,
    stopCamera,
    isActive,
    mode
  };
}
