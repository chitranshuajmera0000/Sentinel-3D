import React, { useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}

export function AlertLog({ log }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [log]);

  const handleExportCSV = () => {
    if (!log || log.length === 0) return;

    const headers = ['wall_time', 'actual_time', 'fight_prob', 'label', 'alert', 'fight_started', 'fight_ended', 'persons'];
    const rows = log.map(entry => {
      return headers.map(h => entry[h]).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "detection_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayLog = log.slice(0, 50);

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col h-[400px] lg:h-[605px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-slate-200 font-semibold text-lg">Alert Log</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar"
      >
        {displayLog.map((entry, idx) => {
          if (entry.fight_started) {
            return (
              <div key={idx} className="bg-red-500/20 border border-red-500/50 p-2 rounded text-red-400 font-bold text-sm flex items-center gap-2">
                🚨 INCIDENT STARTED
                <span className="text-xs font-normal text-slate-400 ml-auto">{entry.actual_time}</span>
              </div>
            );
          }

          if (entry.fight_ended) {
            // Find the most recent fight_started before this entry to compute duration
            const pastLog = displayLog.slice(idx + 1);
            const startEntry = pastLog.find(e => e.fight_started);
            let durationStr = '';
            if (startEntry) {
              const startSec = timeToSeconds(startEntry.actual_time);
              const endSec = timeToSeconds(entry.actual_time);
              const duration = endSec - startSec;
              if (duration > 0) {
                durationStr = ` — duration ${duration}s`;
              }
            }

            return (
              <div key={idx} className="bg-green-500/20 border border-green-500/50 p-2 rounded text-green-400 font-bold text-sm flex items-center gap-2">
                ✓ INCIDENT ENDED {durationStr}
                <span className="text-xs font-normal text-slate-400 ml-auto">{entry.actual_time}</span>
              </div>
            );
          }

          const isFight = entry.label === 'Fight';
          return (
            <div key={idx} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 text-xs font-mono w-16">{entry.actual_time}</span>

              <div className={`px-2 py-0.5 rounded text-xs font-bold w-16 text-center ${isFight ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {isFight ? 'FIGHT' : 'SAFE'}
              </div>

              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFight ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(entry.fight_prob || 0) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">
                  {((entry.fight_prob || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>


          );
        })}
        {displayLog.length === 0 && (
          <div className="text-slate-500 text-sm text-center py-8">No events logged yet.</div>
        )}
      </div>
    </div>
  );
}
