import React from 'react';
import { Clock, Activity, AlertCircle } from 'lucide-react';

function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}

export function IncidentCard({ incident, index }) {
  const startSec = timeToSeconds(incident.actual_time);
  const wallSec = timeToSeconds(incident.wall_time);
  // Handle edge case where wall_time might have wrapped around midnight, though unlikely in a short session
  let delay = wallSec - startSec;
  if (delay < 0) delay += 24 * 3600;
  
  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 transition-all hover:border-slate-500/50 hover:bg-slate-900/60 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-red-400 font-bold text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          INCIDENT #{index + 1}
        </h3>
        <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded font-mono">
          {incident.actual_time}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1"><Clock size={14} /> Detected At</span>
          <span className="text-slate-200 font-mono">{incident.wall_time}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1"><Activity size={14} /> Buffer Delay</span>
          <span className="text-slate-200">{delay}s</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Peak Probability</span>
          <span className="text-red-400 font-bold">{((incident.fight_prob || 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
