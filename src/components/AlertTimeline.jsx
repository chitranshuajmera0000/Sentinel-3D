import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

export function AlertTimeline({ log, currentResult }) {
  const isAlert = currentResult?.log_entry?.alert || currentResult?.label === 'Fight';
  
  // Get last 60 entries and reverse because log has newest at top
  const data = log.slice(0, 60).reverse().map(entry => ({
    time: entry.wall_time,
    prob: entry.fight_prob
  }));

  // Render dot only if probability is above 0.5
  const renderDot = (props) => {
    const { cx, cy, payload, index } = props;
    if (payload.prob >= 0.5) {
      return <circle cx={cx} cy={cy} r={3} fill="#ef4444" stroke="none" key={`dot-${index}`} />;
    }
    return null;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-1 flex flex-col mb-0">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-slate-200 font-semibold text-lg">Live Detection Timeline</h2>
        {isAlert && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5}/>
                <stop offset="50%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity={0.1}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={8} minTickGap={20} />
            <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 1]} ticks={[0, 0.5, 1]} />
            <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="prob" 
              stroke={isAlert ? "#ef4444" : "#06b6d4"} 
              strokeWidth={2}
              fill="url(#probGradient)" 
              isAnimationActive={false}
              dot={renderDot}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
