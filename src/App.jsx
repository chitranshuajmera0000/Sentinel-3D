import React, { useState } from 'react';
import { Shield, ServerCrash, Volume2, VolumeX, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCamera } from './hooks/useCamera';
import { useDetection } from './hooks/useDetection';
import { CameraFeed } from './components/CameraFeed';
import { StatsPanel } from './components/StatsPanel';
import { AlertTimeline } from './components/AlertTimeline';
import { AlertLog } from './components/AlertLog';
import { IncidentCard } from './components/IncidentCard';
import { VideoUpload } from './components/VideoUpload';
import { AboutModel } from './components/AboutModel';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const { videoRef, startCamera, stopCamera, isActive, mode } = useCamera();
  const { result, log, stats, isConnected, latency, sendFrame, activeAlert, isMuted, setIsMuted, clearData } = useDetection();

  const handleStartCamera = async (selectedMode) => {
    clearData();
    await startCamera(selectedMode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 font-sans">
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/90 text-white p-3 text-center text-sm font-bold flex items-center justify-center gap-4 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <ServerCrash size={18} />
            Backend Offline or Unreachable. Retrying...
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
          >
            <RefreshCw size={14} /> Retry Now
          </button>
        </div>
      )}

      {activeAlert && activeTab === 'live' && (
        <div className="fixed top-12 left-0 right-0 bg-red-600 text-white p-4 text-center text-xl font-black flex items-center justify-center gap-3 z-40 shadow-2xl animate-pulse">
          <AlertTriangle size={28} />
          CRITICAL: FIGHT DETECTED IN LIVE FEED
          <AlertTriangle size={28} />
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-4 pt-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Shield className="text-blue-500" />
              Sentinel-3D
              <div className={`w-3 h-3 rounded-full ml-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Model: R3D-18 | val F1: 0.9694 | Dataset: RWF-2000
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2" title="Total Round Trip Time">
              <span className="text-slate-400">Total Latency:</span>
              <span className={`font-mono font-bold ${latency.total > 500 ? 'text-yellow-400' : 'text-green-400'}`}>
                {latency.total}ms
              </span>
            </div>
            {latency.backend > 0 && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2" title="Backend GPU Inference Time">
                <span className="text-slate-400">Backend GPU:</span>
                <span className="font-mono font-bold text-blue-400">
                  {latency.backend}ms
                </span>
              </div>
            )}
            {latency.transfer > 0 && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2" title="Network Transfer & API Overhead">
                <span className="text-slate-400">Network:</span>
                <span className="font-mono font-bold text-purple-400">
                  {latency.transfer}ms
                </span>
              </div>
            )}
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-lg border transition-colors ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
              title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-slate-700 pb-2">
          <button 
            onClick={() => setActiveTab('live')}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'live' ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            📷 Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            📁 Upload Video
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'about' ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            ℹ️ About Model
          </button>
        </div>

        <div className={activeTab === 'live' ? 'block' : 'hidden'}>
            {/* Main Content Grid */}
            <div className="flex flex-col gap-4">
              
              {/* TOP ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left - CameraFeed */}
                <div className="lg:col-span-5 xl:col-span-6 flex flex-col h-full">
                  <CameraFeed 
                    videoRef={videoRef}
                    startCamera={handleStartCamera}
                    stopCamera={stopCamera}
                    isActive={isActive}
                    mode={mode}
                    result={result}
                    sendFrame={sendFrame}
                    isConnected={isConnected}
                  />
                </div>
                {/* Right - Stats and Timeline */}
                <div className="lg:col-span-7 xl:col-span-6 flex flex-col gap-4 h-full">
                  <StatsPanel stats={stats} currentResult={result} />
                  <AlertTimeline log={log} currentResult={result} />
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left - AlertLog */}
                <div className="lg:col-span-5 xl:col-span-6 flex flex-col h-[500px]">
                  <AlertLog log={log} />
                </div>
                {/* Right - Past Incidents */}
                <div className="lg:col-span-7 xl:col-span-6 flex flex-col h-[500px]">
                  {stats?.incidents?.length > 0 ? (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          Past Incidents ({stats.incidents.length})
                        </h2>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 content-start pb-2">
                          {(showAllIncidents ? [...stats.incidents].reverse() : [...stats.incidents].reverse().slice(0, 5)).map((incident, idx) => (
                            <IncidentCard 
                              key={idx} 
                              incident={incident} 
                              index={stats.incidents.length - 1 - idx} 
                            />
                          ))}
                        </div>
                      </div>

                      {stats.incidents.length > 5 && (
                        <button 
                          onClick={() => setShowAllIncidents(!showAllIncidents)}
                          className="w-full mt-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                        >
                          {showAllIncidents ? 'Show Less' : `Show All Incidents (${stats.incidents.length})`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex-1 flex items-center justify-center text-slate-500 italic">
                      No incidents recorded yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
        </div>
        
        <div className={activeTab === 'upload' ? 'block' : 'hidden'}>
          <VideoUpload />
        </div>
        
        <div className={activeTab === 'about' ? 'block' : 'hidden'}>
          <AboutModel />
        </div>

      </div>
    </div>
  );
}
