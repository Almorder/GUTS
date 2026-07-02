import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { TrainingLog } from '../lib/db';
import Header from '../components/Header';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Stats() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  // 1. Weekly Activity (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: d,
      name: format(d, 'EEE'), // Mon, Tue...
      count: 0
    };
  });

  logs.forEach(log => {
    const logDate = new Date(log.created_at).toDateString();
    const dayObj = last7Days.find(d => d.date.toDateString() === logDate);
    if (dayObj) dayObj.count += 1;
  });

  // 2. Energy Levels Over Time (Last 15 logs)
  const energyData = [...logs]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-15)
    .map((log, i) => ({
      index: i,
      energy: log.energy_level,
      date: format(new Date(log.created_at), 'dd/MM')
    }));

  // 3. FL Hold Progression (Example of a tracked metric)
  const flHoldData = [...logs]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(log => {
      let duration = 0;
      if (log.sets) {
        for (const s of log.sets) {
          if (s.movement === 'Front Lever' && s.mechanic === 'Hold' && s.duration) {
            duration = Math.max(duration, s.duration);
          }
        }
      } else if (log.movement === 'Front Lever' && log.mechanic === 'Hold') {
        const match = (log.top_set_performance || '').match(/(\d+\.?\d*)\s*s/i);
        if (match) duration = parseFloat(match[1]);
      }
      return { date: format(new Date(log.created_at), 'dd/MM'), duration };
    })
    .filter(d => d.duration > 0);

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      <Header />
      
      <div className="px-5 mt-4">
        <h2 className="font-serif text-xl font-bold mb-1">Data Matrix</h2>
        <p className="text-xs text-brand-text/50 mb-6">Analyse de tes performances et de ton volume.</p>
        
        <div className="flex flex-col gap-8 pb-10">
          
          {/* Chart 1: Activity */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-text/50 mb-4">Volume (7 Jours)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8f8c85' }} />
                  <Tooltip
                    cursor={{ fill: '#C8C4BC', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: '#F0EBE2', borderColor: '#C8C4BC', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#050403" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Front Lever */}
          {flHoldData.length > 0 && (
            <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-brand-text/50 mb-4">Front Lever (Secondes)</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flHoldData}>
                    <defs>
                      <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CC460C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#CC460C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8f8c85' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#F0EBE2', borderColor: '#C8C4BC', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#CC460C' }}
                    />
                    <Area type="monotone" dataKey="duration" stroke="#CC460C" strokeWidth={2} fillOpacity={1} fill="url(#colorDuration)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Energy */}
          {energyData.length > 0 && (
            <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-brand-text/50 mb-4">Readiness Trend</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#050403" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#050403" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8f8c85' }} />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#F0EBE2', borderColor: '#C8C4BC', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="energy" stroke="#050403" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
