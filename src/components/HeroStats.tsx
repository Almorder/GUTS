import type { TrainingLog } from '../lib/db';
import { calculateXP, getLevel, calculateStreak } from '../lib/progression';
import ProgressRing from './ProgressRing';
import { Flame, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 py-6"
    >
      {/* Level ring */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <ProgressRing progress={xpProgress} size={120} strokeWidth={6}>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold leading-none">{levelInfo.level}</span>
            <span className="text-[10px] uppercase tracking-widest text-brand-text/50 mt-1">Level</span>
          </div>
        </ProgressRing>
      </motion.div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold tracking-tight">{levelInfo.title}</h2>
        <p className="text-xs text-brand-text/50 mt-1 tabular-nums font-medium">
          {xp} XP · <span className="text-brand-accent">{levelInfo.xpInLevel} / {levelInfo.xpForNext}</span> to next
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] px-2">
        <StatPill icon={<Flame size={16} />} value={`${streak}w`} label="Streak" highlight={streak > 0} delay={0.1} />
        <StatPill icon={<Zap size={16} />} value={`${xp}`} label="Total XP" delay={0.2} />
        <StatPill icon={<TrendingUp size={16} />} value={`${totalSessions}`} label="Sessions" delay={0.3} />
      </div>
    </motion.div>
  );
}

function StatPill({
  icon,
  value,
  label,
  highlight = false,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring' }}
      whileHover={{ y: -2 }}
      className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border transition-all duration-300 shadow-sm ${
        highlight ? 'border-brand-accent/50 bg-brand-accent/5 shadow-brand-accent/5' : 'border-brand-border/40 bg-brand-bg/50'
      }`}
    >
      <div className={`${highlight ? 'text-brand-accent' : 'text-brand-text/50'}`}>{icon}</div>
      <span className="font-bold text-base tabular-nums">{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-brand-text/40">{label}</span>
    </motion.div>
  );
}
