import type { TrainingLog, SubSet } from '../lib/db';

interface DashboardProps {
  logs: TrainingLog[];
}

export default function Dashboard({ logs }: DashboardProps) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = logs
    .filter(log => new Date(log.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (recentLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="text-4xl">🎯</div>
        <p className="text-sm text-brand-text/40 text-center">
          Aucune performance récente.<br/>
          <span className="text-brand-accent font-bold">Log ton premier Top Set.</span>
        </p>
      </div>
    );
  }

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
    <div className="flex flex-col gap-4 pb-8">
      {Array.from(grouped.entries()).map(([day, dayLogs]) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">{day}</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>
          <div className="flex flex-col gap-2">
            {dayLogs.map(log => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        </div>
      ))}
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

function LogCard({ log }: { log: TrainingLog }) {
  const movementColors: Record<string, string> = {
    'Front Lever': '🔒',
    'Planche': '🔥',
    'Handstand': '🤸',
    'Accessoire': '🔧',
  };

  // Support V2 legacy
  const sets = log.sets && log.sets.length > 0 ? log.sets : [
    { movement: log.movement!, mechanic: log.mechanic!, level: log.level!, reps: 0, duration: 0, weight: 0 }
  ];
  
  const mainMovement = sets[0].movement;

  return (
    <div className={`flex items-start gap-3 p-3 border rounded-lg transition-colors duration-200 ${
      log.is_exam ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-bg hover:border-brand-text/20'
    }`}>
      {/* Icon */}
      <div className="text-xl shrink-0 pt-1">
        {log.is_exam ? '🎓' : (movementColors[mainMovement] || '📊')}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {sets.map((s, i) => (
          <div key={i} className={`flex items-center justify-between ${i > 0 ? 'pt-2 border-t border-brand-border/50' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate">{s.movement}</span>
                <span className="text-[9px] uppercase tracking-wider text-brand-text/50 bg-brand-border/30 px-1.5 py-0.5 rounded">
                  {s.level}
                </span>
              </div>
              <p className="text-[10px] text-brand-text/40 mt-0.5 uppercase tracking-wider">{s.mechanic}</p>
            </div>
            
            <div className="text-right shrink-0">
              <span className={`text-sm font-bold ${log.is_exam ? 'text-brand-text' : 'text-brand-accent'}`}>
                {log.sets ? formatPerformance(s) : log.top_set_performance}
              </span>
            </div>
          </div>
        ))}
        
        {/* Footer (Tags + Energy) */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-brand-border/30">
          <div className="flex flex-wrap gap-1">
            {log.tags?.map(t => (
              <span key={t} className="text-[9px] uppercase font-bold text-brand-text/40 bg-brand-border/20 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
            {!log.tags && log.notes && (
              <span className="text-[9px] text-brand-text/40 italic truncate max-w-[100px]">{log.notes}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text/30">{log.cycle_type}</span>
            <div className="flex gap-px">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-2 rounded-sm ${
                    i < log.energy_level ? (log.energy_level >= 8 ? 'bg-brand-accent' : 'bg-brand-text/60') : 'bg-brand-border/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
