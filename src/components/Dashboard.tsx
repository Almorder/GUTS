import type { TrainingLog } from '../lib/db';

interface DashboardProps {
  logs: TrainingLog[];
}

export default function Dashboard({ logs }: DashboardProps) {
  // Filter for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = logs
    .filter(log => new Date(log.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (recentLogs.length === 0) {
    return (
      <div className="text-center py-10 border border-brand-border text-brand-text/50 text-sm">
        Aucune performance récente.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-serif font-bold text-lg mb-2">Recent Sets (7 days)</h3>
      <div className="border border-brand-border rounded-sm overflow-hidden">
        {recentLogs.map((log, index) => {
          const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div 
              key={log.id} 
              className={`flex items-center justify-between p-3 text-sm ${index !== recentLogs.length - 1 ? 'border-b border-brand-border' : ''}`}
            >
              <div className="flex flex-col">
                <span className="font-bold">{log.movement}</span>
                <span className="text-xs text-brand-text/70">{log.level} • {log.mechanic}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-brand-accent">{log.top_set_performance}</span>
                <span className="text-xs text-brand-text/50">{dateStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
