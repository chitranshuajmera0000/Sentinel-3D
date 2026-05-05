import React from 'react';
import { Activity, AlertTriangle, ShieldAlert, Target } from 'lucide-react';

export function StatsPanel({ stats, currentResult }) {
  const isAlert = currentResult?.log_entry?.alert || currentResult?.label === 'Fight';
  const pulseClass = isAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-slate-700';

  const cards = [
    {
      label: 'Total Frames Analyzed',
      value: stats?.total || 0,
      icon: <Activity className="text-blue-400" size={24} />,
      pulse: false
    },
    {
      label: 'Fight Detections',
      value: stats?.fights || 0,
      icon: <ShieldAlert className="text-red-400" size={24} />,
      pulse: isAlert
    },
    {
      label: 'Peak Fight Probability',
      value: `${((stats?.max_prob || 0) * 100).toFixed(1)}%`,
      icon: <Target className="text-purple-400" size={24} />,
      pulse: isAlert
    },
    {
      label: 'Incidents Detected',
      value: stats?.incidents?.length || 0,
      icon: <AlertTriangle className="text-orange-400" size={24} />,
      pulse: isAlert
    }
  ];

  return (
    <div className="grid grid-cols-2 2xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`bg-slate-800 p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${card.pulse ? pulseClass : 'border-slate-700'}`}
        >
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
