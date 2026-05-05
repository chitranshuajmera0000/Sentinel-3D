import { useState, useRef, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useDetection() {
  const [result, setResult] = useState(() => JSON.parse(localStorage.getItem('cv_result')) || null);
  const [log, setLog] = useState(() => JSON.parse(localStorage.getItem('cv_log')) || []);
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem('cv_stats')) || { total: 0, fights: 0, max_prob: 0, incidents: [] });
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState({ total: 0, backend: 0, transfer: 0 });
  const [activeAlert, setActiveAlert] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('cv_muted') === 'true');

  useEffect(() => { localStorage.setItem('cv_result', JSON.stringify(result)); }, [result]);
  useEffect(() => { localStorage.setItem('cv_log', JSON.stringify(log)); }, [log]);
  useEffect(() => { localStorage.setItem('cv_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('cv_muted', isMuted); }, [isMuted]);

  const clearData = useCallback(() => {
    setResult(null);
    setLog([]);
    setStats({ total: 0, fights: 0, max_prob: 0, incidents: [] });
    setLatency({ total: 0, backend: 0, transfer: 0 });
    localStorage.removeItem('cv_result');
    localStorage.removeItem('cv_log');
    localStorage.removeItem('cv_stats');
  }, []);

  const sendingRef = useRef(false);
  const alertTimeoutRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.error('Audio play error:', err);
    }
  }, []);

  const sendFrame = useCallback(async (videoEl) => {
    if (!videoEl || videoEl.readyState < 2) return;
    if (sendingRef.current) return;
    
    sendingRef.current = true;
    const startMs = Date.now();

    try {
      // 1. Scale down to max 480px on longest side
      const aspect = videoEl.videoWidth / videoEl.videoHeight;
      let targetW = videoEl.videoWidth;
      let targetH = videoEl.videoHeight;

      if (targetW > targetH && targetW > 480) {
        targetW = 480;
        targetH = 480 / aspect;
      } else if (targetH > targetW && targetH > 480) {
        targetH = 480;
        targetW = 480 * aspect;
      } else if (targetW > 480 && targetH === targetW) {
        targetW = 480;
        targetH = 480;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, targetW, targetH);

      // 2. Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
      if (!blob) {
        sendingRef.current = false;
        return;
      }

      // 3. Send using FormData
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const totalMs = Date.now() - startMs;
      // Expect backend to return process_time_ms for GPU time, otherwise default to 0
      const backendMs = data.process_time_ms || 0; 
      const transferMs = Math.max(0, totalMs - backendMs);

      setIsConnected(true);
      setLatency({
        total: totalMs,
        backend: backendMs,
        transfer: transferMs
      });
      setResult(data);

      if (data.log_entry) {
        setLog(prev => {
          const newLog = [data.log_entry, ...prev];
          return newLog.slice(0, 100);
        });

        if (data.log_entry.fight_started) {
          if (!isMuted) playBeep();
          setActiveAlert(true);
          if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = setTimeout(() => setActiveAlert(false), 5000);
        }
      }
    } catch (err) {
      console.error('Frame send error:', err);
      setIsConnected(false);
    } finally {
      sendingRef.current = false;
    }
  }, [playBeep, isMuted]);

  // Poll /stats every 5 seconds separately
  useEffect(() => {
    const fetchStats = async () => {
      if (!API_URL) return;
      try {
        const response = await fetch(`${API_URL}/stats`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error('Stats poll error:', err);
        setIsConnected(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return {
    result,
    log,
    stats,
    isConnected,
    latency,
    sendFrame,
    activeAlert,
    isMuted,
    setIsMuted,
    clearData
  };
}
