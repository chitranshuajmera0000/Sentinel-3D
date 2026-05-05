import React, { useState, useRef, useMemo } from 'react';
import { UploadCloud, FileVideo, Download, AlertCircle, Clock, Activity, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export function VideoUpload() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const [activeTime, setActiveTime] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
      setResults(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped);
      setVideoUrl(URL.createObjectURL(dropped));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/analyze_video`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze video. Check backend connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportCSV = () => {
    if (!results?.predictions) return;
    const headers = ['Time (s)', 'Label', 'Fight Prob', 'Alert'];
    const rows = results.predictions.map(p => `${p.time_sec},${p.label},${p.fight_prob},${p.alert}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "video_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setActiveTime(videoRef.current.currentTime);
  };

  const seekToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(() => {});
    }
  };

  const renderSparkline = () => {
    if (!results?.predictions || results.predictions.length === 0) return null;
    const pts = results.predictions.map((p, i) => {
      const x = (i / (results.predictions.length - 1)) * 100;
      const y = 100 - (p.fight_prob * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-12 w-full border-b border-slate-700 relative bg-slate-900/50">
        <div className="absolute top-1 left-2 text-[10px] text-slate-500">100%</div>
        <div className="absolute bottom-1 left-2 text-[10px] text-slate-500">0%</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible opacity-80">
          <polyline points={pts} fill="none" stroke="#ef4444" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    );
  };

  // Check if current time is near the peak gradcam frame
  const isNearGradcam = results?.gradcam_time_sec !== undefined && activeTime !== null && Math.abs(activeTime - results.gradcam_time_sec) < 1.0;

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col xl:flex-row gap-6">
      {/* Left Panel: Upload and Player */}
      <div className="flex-1 flex flex-col gap-4">
        {!videoUrl ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex-1 border-2 border-dashed border-slate-600 hover:border-slate-400 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center p-8 transition-colors cursor-pointer min-h-[300px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} className="text-slate-400 mb-4" />
            <p className="text-slate-200 font-medium mb-1">Click or drag a video to upload</p>
            <p className="text-slate-500 text-sm">Supports .mp4, .avi, .mov</p>
            <input type="file" accept="video/mp4,video/avi,video/quicktime" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex-1 relative min-h-[300px] flex items-center justify-center">
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain absolute inset-0"
              />
              {isNearGradcam && results?.gradcam_base64 && (
                <img 
                  src={`data:image/jpeg;base64,${results.gradcam_base64}`} 
                  alt="GradCAM Heatmap"
                  className="absolute inset-0 w-full h-full object-contain opacity-60 pointer-events-none mix-blend-screen" 
                />
              )}
            </div>
            
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileVideo size={20} className="text-blue-400 shrink-0" />
                <span className="text-slate-300 text-sm font-mono truncate max-w-[150px]" title={file.name}>{file.name}</span>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button 
                  onClick={() => { setFile(null); setVideoUrl(null); setResults(null); }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || results}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:text-white/50 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {isAnalyzing ? 'Analyzing...' : results ? 'Done' : 'Analyze Video'}
                </button>
              </div>
            </div>

            {isAnalyzing && (
              <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/30 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-400 text-sm font-medium animate-pulse text-center">Analyzing... this may take a few seconds.</p>
              </div>
            )}
            
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg border border-red-500/30 text-sm">{error}</div>}
          </div>
        )}
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 flex flex-col gap-4">
        {!results ? (
          <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[300px]">
            <Activity size={48} className="mb-4 opacity-50" />
            <p>Upload and analyze a video to see results here.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            <div className={`p-4 rounded-xl border-2 text-center text-lg font-bold flex items-center justify-center gap-2 ${results.summary.fight_windows > 0 ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-green-500/20 border-green-500 text-green-400'}`}>
              {results.summary.fight_windows > 0 ? <><AlertCircle /> 🚨 FIGHT DETECTED</> : '✓ No fight detected'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                <Clock className="text-blue-400" size={20} />
                <div>
                  <p className="text-slate-400 text-xs">Duration</p>
                  <p className="text-white font-bold">{results.summary.duration_sec}s</p>
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                <Activity className="text-purple-400" size={20} />
                <div>
                  <p className="text-slate-400 text-xs">Fight Windows</p>
                  <p className="text-white font-bold">{results.summary.fight_windows} / {results.summary.total_windows}</p>
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3 col-span-2">
                <Target className="text-orange-400" size={20} />
                <div>
                  <p className="text-slate-400 text-xs">Peak Prob</p>
                  <p className="text-white font-bold">{(results.summary.max_prob * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden min-h-[250px] max-h-[400px]">
              <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
                <h3 className="font-semibold text-slate-200 text-sm">Timeline</h3>
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              
              {renderSparkline()}
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                      <th className="p-2 pl-4 font-medium">Time (s)</th>
                      <th className="p-2 font-medium">Label</th>
                      <th className="p-2 font-medium">Prob</th>
                      <th className="p-2 pr-4 font-medium text-center">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.predictions.map((p, idx) => {
                      const isActiveRow = activeTime !== null && Math.abs(activeTime - p.time_sec) < 0.5;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => seekToTime(p.time_sec)}
                          className={`border-b border-slate-800 cursor-pointer transition-colors ${isActiveRow ? 'bg-blue-500/20' : 'hover:bg-slate-800/50'}`}
                        >
                          <td className="p-2 pl-4 font-mono">{p.time_sec}s</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.label === 'Fight' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {p.label}
                            </span>
                          </td>
                          <td className="p-2 font-mono">{(p.fight_prob * 100).toFixed(0)}%</td>
                          <td className="p-2 pr-4 text-center">
                            {p.alert && <AlertCircle size={14} className="text-red-500 inline" />}
                          </td>
                        </tr>
                      );
                    })}
                    {results.predictions.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-slate-500 italic">No windows found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
