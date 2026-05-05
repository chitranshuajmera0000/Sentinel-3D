import React, { useEffect, useRef, useCallback } from 'react';
import { MonitorUp, Square } from 'lucide-react';
import { drawDetection } from '../utils/canvas';

export function CameraFeed({ 
  videoRef, 
  startCamera, 
  stopCamera, 
  isActive, 
  mode, 
  result, 
  sendFrame, 
  isConnected 
}) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const resultRef = useRef(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  // Animation loop for smooth canvas drawing
  const animate = useCallback(() => {
    if (canvasRef.current && videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      drawDetection(ctx, videoRef.current, resultRef.current, width, height);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [videoRef]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Frame sending interval
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        sendFrame(videoRef.current);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isActive, sendFrame, videoRef]);

  const isAlert = result?.log_entry?.alert || result?.label === 'Fight';

  return (
    <div className={`flex flex-col h-full gap-4 p-4 bg-slate-800 rounded-xl border-2 transition-colors duration-300 ${isAlert ? 'border-red-500 animate-pulse-border-red' : 'border-slate-700'}`}>
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-slate-300">
            {isActive ? `Live Screen Sharing` : 'Screen Sharing Offline'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => startCamera('screen')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MonitorUp size={16} /> Share Screen
          </button>
          {isActive && (
            <button 
              onClick={stopCamera}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              <Square size={16} fill="currentColor" /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-4">
        {/* Raw Video */}
        <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative min-h-[300px]">
          <span className="absolute top-2 left-2 text-xs font-mono text-slate-400 z-10 bg-black/50 px-2 py-1 rounded">RAW FEED</span>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${mode === 'webcam' ? '-scale-x-100' : ''}`}
          />
        </div>

        {/* Processed Canvas */}
        <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative min-h-[300px]">
          <span className="absolute top-2 left-2 text-xs font-mono text-slate-400 z-10 bg-black/50 px-2 py-1 rounded">DETECTION</span>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
