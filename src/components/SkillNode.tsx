import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Skill } from '../lib/progression';

interface SkillNodeProps {
  skill: Skill;
  onClick: () => void;
  isActive?: boolean;
}

export default function SkillNode({ skill, onClick, isActive }: SkillNodeProps) {
  const total = skill.milestones.length;
  const unlocked = skill.milestones.filter(m => m.unlocked).length;
  const progressPercent = (unlocked / total) * 100;
  
  const size = 80;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <motion.button
      whileHover={!skill.isLocked ? { scale: 1.05 } : {}}
      whileTap={!skill.isLocked ? { scale: 0.95 } : {}}
      onClick={!skill.isLocked ? onClick : undefined}
      className={`relative flex flex-col items-center justify-center gap-2 group ${skill.isLocked ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'}`}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background Ring */}
        <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
          <circle
            className="text-brand-border/40"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Ring */}
          <motion.circle
            className={skill.isLocked ? 'text-brand-text/30' : 'text-brand-accent'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Icon Center */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-brand-bg border border-brand-border/50 shadow-sm transition-colors ${isActive ? 'bg-brand-accent/10 border-brand-accent' : ''}`}>
          {skill.icon}
        </div>
        
        {/* Lock Overlay */}
        {skill.isLocked && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[1px]">
            <Lock size={20} className="text-white/80" />
          </div>
        )}
      </div>

      <div className="text-center">
        <span className={`block text-[11px] font-bold uppercase tracking-wider ${skill.isLocked ? 'text-brand-text/40' : 'text-brand-text'}`}>
          {skill.name}
        </span>
        <span className="block text-[9px] text-brand-text/50 font-medium">
          {unlocked}/{total}
        </span>
      </div>
    </motion.button>
  );
}
