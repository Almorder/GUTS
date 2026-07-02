import type { TrainingLog } from '../lib/db';
import { calculateXP, getLevel, calculateStreak } from '../lib/progression';
import ProgressRing from './ProgressRing';
import { Flame, Zap, TrendingUp } from 'lucide-react';

interface HeroStatsProps {
  logs: TrainingLog[];
}

export default function HeroStats({ logs }: HeroStatsProps) {
  const xp = calculateXP(logs);
  const levelInfo = getLevel(xp);
  const streak = calculateStreak(logs);
  const totalSessions = logs.length;
  const xpProgress = levelInfo.xpForNext > 0
    ? (levelInfo.xpInLevel / levelInfo.xpForNext) * 100
    : 100;

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {/* Level ring */}
      <ProgressRing progress={xpProgress} size={110} strokeWidth={5}>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-serif font-bold leading-none">{levelInfo.level}</span>
          <span className="text-[9px] uppercase tracking-widest text-brand-text/50 mt-0.5">Level</span>
        </div>
      </ProgressRing>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-serif text-xl font-bold tracking-tight">{levelInfo.title}</h2>
        <p className="text-xs text-brand-text/40 mt-1 tabular-nums">
          {xp} XP · {levelInfo.xpInLevel} / {levelInfo.xpForNext} to next
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        <StatPill icon={<Flame size={14} />} value={`${streak}w`} label="Streak" highlight={streak > 0} />
        <StatPill icon={<Zap size={14} />} value={`${xp}`} label="Total XP" />
        <StatPill icon={<TrendingUp size={14} />} value={`${totalSessions}`} label="Sessions" />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-colors duration-300 ${
      highlight ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border'
    }`}>
      <div className={`${highlight ? 'text-brand-accent' : 'text-brand-text/60'}`}>{icon}</div>
      <span className="font-bold text-sm tabular-nums">{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-brand-text/40">{label}</span>
    </div>
  );
}
