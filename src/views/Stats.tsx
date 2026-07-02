import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/db';
import type { TrainingLog, Movement, Mechanic } from '../lib/db';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Activity, Flame, Medal, X as CloseIcon } from 'lucide-react';
import Dashboard from '../components/Dashboard';

export default function Stats() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  // --- Heatmap Data (Last 12 weeks = 84 days) ---
  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 83; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toDateString();
      const count = logs.filter(l => new Date(l.created_at).toDateString() === dateStr).length;
      data.push({ date: d, count });
    }
    return data;
  }, [logs]);

  // --- Graph Extractor ---
  const getGraphData = (movement: Movement, mechanic: Mechanic, type: 'duration' | 'reps' | 'weight') => {
    return [...logs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(log => {
        let val = 0;
        if (log.sets) {
          for (const s of log.sets) {
            if (s.movement === movement && s.mechanic === mechanic) {
              if (type === 'duration' && s.duration) val = Math.max(val, s.duration);
              if (type === 'reps' && s.reps) val = Math.max(val, s.reps);
              if (type === 'weight' && s.weight) val = Math.max(val, s.weight);
            }
          }
        }
        return { date: format(new Date(log.created_at), 'dd/MM'), value: val };
      })
      .filter(d => d.value > 0);
  };

  const flData = getGraphData('Front Lever', 'Hold', 'duration');
  const plData = getGraphData('Planche', 'Hold', 'duration');
  const hsData = getGraphData('Handstand', 'Hold', 'duration');
  const pullData = getGraphData('Accessoire', 'Pull', 'weight');

  // --- Readiness Trend ---
  const energyData = [...logs]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-20)
    .map(log => ({
      energy: log.energy_level,
      date: format(new Date(log.created_at), 'dd/MM')
    }));

  // --- Personal Records ---
  const prs = useMemo(() => {
    let bestFl = 0;
    let bestPl = 0;
    let maxPull = 0;
    logs.forEach(log => {
      if (log.sets) {
        log.sets.forEach(s => {
          if (s.movement === 'Front Lever' && s.mechanic === 'Hold' && s.duration) bestFl = Math.max(bestFl, s.duration);
          if (s.movement === 'Planche' && s.mechanic === 'Hold' && s.duration) bestPl = Math.max(bestPl, s.duration);
          if (s.movement === 'Accessoire' && s.mechanic === 'Pull' && s.weight) maxPull = Math.max(maxPull, s.weight);
        });
      }
    });
    return { bestFl, bestPl, maxPull };
  }, [logs]);

  return (
    <div className="flex flex-col gap-0 min-h-screen px-4 pb-12">
      <div className="mt-2 mb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Data Matrix</h2>
        <p className="text-xs font-medium text-brand-text/50">Analyse de tes performances, volume et records.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* PR Badges */}
        <div className="grid grid-cols-3 gap-3">
          <PRBadge icon={<Medal size={16} />} title="Best FL" value={`${prs.bestFl}s`} delay={0.1} />
          <PRBadge icon={<Flame size={16} />} title="Best PL" value={`${prs.bestPl}s`} delay={0.2} />
          <PRBadge icon={<Trophy size={16} />} title="Max Pull" value={`+${prs.maxPull}kg`} delay={0.3} />
        </div>

        {/* Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-text" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">Activité (12 Semaines)</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {heatmapData.map((d, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedDate(d.date)}
                className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 focus:outline-none ${
                  selectedDate?.toDateString() === d.date.toDateString() ? 'ring-2 ring-brand-text ring-offset-1 ring-offset-brand-bg' : ''
                } ${
                  d.count === 0 ? 'bg-brand-border/20 hover:bg-brand-border/40' : 
                  d.count === 1 ? 'bg-brand-accent/40' : 
                  d.count === 2 ? 'bg-brand-accent/70' : 
                  'bg-brand-accent'
                }`}
                title={`${format(d.date, 'dd MMM')} : ${d.count} session(s)`}
              />
            ))}
          </div>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden border-t border-brand-border/30 pt-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
                    <Activity size={14} className="text-brand-accent" />
                    Séance du {format(selectedDate, 'dd/MM/yyyy')}
                  </h3>
                  <button 
                    onClick={() => setSelectedDate(null)} 
                    className="p-1 rounded-md bg-brand-border/20 text-brand-text/50 hover:text-brand-text transition-colors"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  <Dashboard logs={logs.filter(l => new Date(l.created_at).toDateString() === selectedDate.toDateString())} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chart 1: Front Lever */}
        <ChartCard title="Front Lever Hold (sec)" data={flData} dataKey="value" color="var(--brand-accent)" />

        {/* Chart 2: Planche */}
        <ChartCard title="Planche Hold (sec)" data={plData} dataKey="value" color="var(--brand-text)" />

        {/* Chart 3: Handstand */}
        <ChartCard title="Handstand Hold (sec)" data={hsData} dataKey="value" color="#8f8c85" />

        {/* Chart 4: Weighted Pull */}
        <ChartCard title="Weighted Pull (+kg)" data={pullData} dataKey="value" color="var(--brand-accent)" />

        {/* Chart 5: Readiness Trend */}
        <ChartCard title="Readiness Trend (Energy)" data={energyData} dataKey="energy" color="var(--brand-text)" hideYAxis />

      </div>
    </div>
  );
}

function PRBadge({ icon, title, value, delay }: { icon: React.ReactNode, title: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className="bg-brand-text/5 border border-brand-border/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm"
    >
      <div className="text-brand-accent mb-1">{icon}</div>
      <span className="font-bold text-lg tabular-nums text-brand-text leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wider font-bold text-brand-text/50">{title}</span>
    </motion.div>
  );
}

function ChartCard({ title, data, dataKey, color, hideYAxis }: { title: string, data: any[], dataKey: string, color: string, hideYAxis?: boolean }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
    >
      <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60 mb-5">{title}</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-border)', fontWeight: 600 }} dy={10} />
            {!hideYAxis && <YAxis hide />}
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--brand-bg)', borderColor: 'var(--brand-border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: color }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#gradient-${dataKey}-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
