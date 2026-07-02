import { useState } from 'react';
import type { TrainingLog, SubSet } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Trash2, Filter } from 'lucide-react';

interface DashboardProps {
  logs: TrainingLog[];
  onDelete?: (id: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function Dashboard({ logs, onDelete }: DashboardProps) {
  const [filter, setFilter] = useState<'All' | 'Exam' | 'Force'>('All');
  
  const recentLogs = logs
    .filter(log => {
      if (filter === 'Exam') return log.is_exam;
      if (filter === 'Force') return log.cycle_type === 'Force';
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15); // Show latest 15

  const grouped = new Map<string, TrainingLog[]>();
  for (const log of recentLogs) {
    const dayKey = new Date(log.created_at).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    if (!grouped.has(dayKey)) grouped.set(dayKey, []);
    grouped.get(dayKey)!.push(log);
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Filters */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {['All', 'Exam', 'Force'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-colors ${
                  filter === f ? 'bg-brand-text text-brand-bg' : 'bg-brand-text/5 text-brand-text/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Filter size={14} className="text-brand-text/30" />
        </div>
      )}

      {recentLogs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-5xl opacity-50">🎯</div>
          <p className="text-sm text-brand-text/40 text-center leading-relaxed">
            Aucune performance correspondante.<br/>
            <span className="text-brand-accent font-bold">Log ton premier Top Set.</span>
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {Array.from(grouped.entries()).map(([day, dayLogs]) => (
            <div key={day}>
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border/30">{day}</span>
                <div className="flex-1 h-px bg-brand-border/40" />
              </motion.div>
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {dayLogs.map(log => (
                    <motion.div key={log.id} variants={itemVariants} layout exit="exit">
                      <LogCard log={log} onDelete={() => onDelete?.(log.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function formatPerformance(s: SubSet) {
  const parts = [];
  if (s.reps) parts.push(`${s.reps}r`);
  if (s.duration) parts.push(`${s.duration}s`);
  if (s.weight) parts.push(`+${s.weight}kg`);
  return parts.join(' ') || '0';
}

function LogCard({ log, onDelete }: { log: TrainingLog, onDelete: () => void }) {
  const movementColors: Record<string, string> = {
    'Front Lever': '🔒',
    'Planche': '🔥',
    'Handstand': '🤸',
    'Tractions': '💪',
    'Dips': '🔱',
    'L-sit': '📐',
    'Renforcement': '🏋️',
    'Accessoire': '🔧',
  };

  const sets = log.sets && log.sets.length > 0 ? log.sets : [
    { movement: log.movement!, mechanic: log.mechanic!, level: log.level!, reps: 0, duration: 0, weight: 0 }
  ];
  
  const mainMovement = sets[0].movement;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative group flex items-start gap-4 p-4 border rounded-2xl transition-all duration-300 shadow-sm ${
        log.is_exam ? 'border-brand-accent/50 bg-brand-accent/5' : 'border-brand-border/40 bg-brand-bg hover:border-brand-border/80'
      }`}
    >
      <div className="text-2xl shrink-0 pt-1">
        {log.is_exam ? '🎓' : (movementColors[mainMovement] || '📊')}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {sets.map((s, i) => (
          <div key={i} className={`flex items-center justify-between ${i > 0 ? 'pt-2 border-t border-brand-border/30' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate text-brand-text">{s.movement}</span>
                <span className="text-[9px] uppercase tracking-wider text-brand-text/50 bg-brand-text/5 border border-brand-border/20 px-1.5 py-0.5 rounded">
                  {s.level}
                </span>
              </div>
              <p className="text-[10px] text-brand-text/40 mt-0.5 uppercase tracking-wider font-medium">{s.mechanic}</p>
            </div>
            
            <div className="text-right shrink-0">
              <span className={`text-sm font-bold bg-brand-bg px-2 py-1 rounded-md border border-brand-border/20 ${log.is_exam ? 'text-brand-text' : 'text-brand-accent'}`}>
                {log.sets ? formatPerformance(s) : log.top_set_performance}
              </span>
            </div>
          </div>
        ))}
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/30">
          <div className="flex flex-wrap gap-1">
            {log.tags?.map(t => (
              <span key={t} className="text-[9px] uppercase font-bold text-brand-text/50 bg-brand-text/5 border border-brand-border/20 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
            {!log.tags && log.notes && (
              <span className="text-[10px] text-brand-text/40 italic truncate max-w-[120px]">{log.notes}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text/30">{log.cycle_type}</span>
            <div className="flex gap-px">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-2 rounded-sm ${
                    i < log.energy_level ? (log.energy_level >= 8 ? 'bg-brand-accent' : 'bg-brand-text') : 'bg-brand-border/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 p-2 text-brand-text/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
