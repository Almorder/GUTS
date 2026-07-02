import type { TrainingLog } from '../lib/db';

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
          Aucune performance cette semaine.<br/>
          <span className="text-brand-accent font-bold">Log ton premier Top Set.</span>
        </p>
      </div>
    );
  }

  // Group by day
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
    <div className="flex flex-col gap-4">
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

function LogCard({ log }: { log: TrainingLog }) {
  const movementColors: Record<string, string> = {
    'Front Lever': '🔒',
    'Planche': '🔥',
    'Handstand': '🤸',
    'Accessoire': '🔧',
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-brand-border rounded-lg hover:border-brand-text/20 transition-colors duration-200">
      {/* Icon */}
      <div className="text-xl shrink-0">
        {movementColors[log.movement] || '📊'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm truncate">{log.movement}</span>
          <span className="text-[10px] uppercase tracking-wider text-brand-text/40 bg-brand-text/5 px-1.5 py-0.5 rounded">
            {log.level}
          </span>
        </div>
        <p className="text-xs text-brand-text/50 mt-0.5">{log.mechanic} · {log.cycle_type}</p>
      </div>

      {/* Performance */}
      <div className="text-right shrink-0">
        <span className="text-sm font-bold text-brand-accent">{log.top_set_performance}</span>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <div className="flex gap-px">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-2 rounded-sm ${
                  i < log.energy_level ? 'bg-brand-text/60' : 'bg-brand-border/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
