import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/db';
import type { TrainingLog, Movement, Mechanic, Level } from '../lib/db';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Trophy, Activity, Flame, Medal } from 'lucide-react';
import { motion } from 'framer-motion';



export default function Stats() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  // --- Weekly Volume Data (Last 4 Weeks) ---
  const weeklyVolume = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const start = subDays(now, i * 7 + 7);
      const end = subDays(now, i * 7);
      const count = logs.filter(l => {
        const d = new Date(l.created_at);
        return d > start && d <= end;
      }).length;
      data.push({ week: i === 0 ? 'Cette Semaine' : `S-${i}`, count });
    }
    return data;
  }, [logs]);

  // --- Graph Extractor ---
  const LEVELS_ORDER: Level[] = ['Base', 'Tuck', 'Adv Tuck', 'Straddle', 'Half Lay', 'Full'];
  
  const getBestLevelForMovement = (movement: Movement, mechanic: Mechanic): Level => {
    let highestIdx = 0;
    logs.forEach(log => {
      if (log.sets) {
        log.sets.forEach(s => {
          if (s.movement === movement && s.mechanic === mechanic) {
            const idx = LEVELS_ORDER.indexOf(s.level as Level);
            if (idx > highestIdx) highestIdx = idx;
          }
        });
      }
    });
    return LEVELS_ORDER[highestIdx];
  };

  const getGraphData = (movement: Movement, mechanic: Mechanic, type: 'duration' | 'reps' | 'weight', level: Level) => {
    return [...logs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(log => {
        let val = 0;
        if (log.sets) {
          for (const s of log.sets) {
            if (s.movement === movement && s.mechanic === mechanic && s.level === level) {
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

  const flBestLvl = getBestLevelForMovement('Front Lever', 'Hold');
  const flData = getGraphData('Front Lever', 'Hold', 'duration', flBestLvl);

  const plBestLvl = getBestLevelForMovement('Planche', 'Hold');
  const plData = getGraphData('Planche', 'Hold', 'duration', plBestLvl);

  const hsBestLvl = getBestLevelForMovement('Handstand', 'Hold');
  const hsData = getGraphData('Handstand', 'Hold', 'duration', hsBestLvl);

  const pullBestLvl = getBestLevelForMovement('Tractions', 'Pull');
  const pullData = getGraphData('Tractions', 'Pull', 'reps', pullBestLvl);

  const dipsBestLvl = getBestLevelForMovement('Dips', 'Push');
  const dipsData = getGraphData('Dips', 'Push', 'reps', dipsBestLvl);

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
    let bestPull = 0;
    let bestDips = 0;
    logs.forEach(log => {
      if (log.sets) {
        log.sets.forEach(s => {
          if (s.movement === 'Front Lever' && s.mechanic === 'Hold' && s.duration) bestFl = Math.max(bestFl, s.duration);
          if (s.movement === 'Planche' && s.mechanic === 'Hold' && s.duration) bestPl = Math.max(bestPl, s.duration);
          if (s.movement === 'Tractions' && s.mechanic === 'Pull' && s.reps) bestPull = Math.max(bestPull, s.reps);
          if (s.movement === 'Dips' && s.reps) bestDips = Math.max(bestDips, s.reps);
        });
      }
    });
    return { bestFl, bestPl, bestPull, bestDips };
  }, [logs]);

  return (
    <div className="flex flex-col gap-0 min-h-screen px-4 pb-12">
      <div className="mt-2 mb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Data Matrix</h2>
        <p className="text-xs font-medium text-brand-text/50">Analyse de tes performances, volume et records.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* PR Badges */}
        <div className="grid grid-cols-2 gap-3">
          <PRBadge icon={<Medal size={16} />} title="Best FL" value={`${prs.bestFl}s`} delay={0.1} />
          <PRBadge icon={<Flame size={16} />} title="Best PL" value={`${prs.bestPl}s`} delay={0.2} />
          <PRBadge icon={<Trophy size={16} />} title="Max Pull" value={`${prs.bestPull}r`} delay={0.3} />
          <PRBadge icon={<Activity size={16} />} title="Max Dips" value={`${prs.bestDips}r`} delay={0.4} />
        </div>

        {/* Weekly Volume */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-text" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">Volume (4 Semaines)</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-border)', fontWeight: 600 }} dy={10} />
                <Tooltip
                  cursor={{ fill: 'var(--brand-border)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'var(--brand-bg)', borderColor: 'var(--brand-border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="var(--brand-accent)" radius={[6, 6, 6, 6]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 1: Front Lever */}
        <ChartCard title={`Front Lever (${flBestLvl}) (sec)`} data={flData} dataKey="value" color="var(--brand-accent)" />

        {/* Chart 2: Planche */}
        <ChartCard title={`Planche (${plBestLvl}) (sec)`} data={plData} dataKey="value" color="var(--brand-text)" />

        {/* Chart 3: Handstand */}
        <ChartCard title={`Handstand (${hsBestLvl}) (sec)`} data={hsData} dataKey="value" color="#8f8c85" />

        {/* Chart 4: Weighted Pull */}
        <ChartCard title={`Tractions (${pullBestLvl}) (reps)`} data={pullData} dataKey="value" color="var(--brand-accent)" />

        {/* Chart 5: Dips */}
        <ChartCard title={`Dips (${dipsBestLvl}) (reps)`} data={dipsData} dataKey="value" color="#8f8c85" />

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
