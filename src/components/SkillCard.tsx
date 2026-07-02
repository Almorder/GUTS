import type { Skill } from '../lib/progression';
import { getSkillProgress, getNextMilestone, getCurrentTier } from '../lib/progression';
import ProgressRing from './ProgressRing';
import { motion } from 'framer-motion';

interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

export default function SkillCard({ skill, onClick }: SkillCardProps) {
  const progress = getSkillProgress(skill);
  const nextMilestone = getNextMilestone(skill);
  const tier = getCurrentTier(skill);
  const totalTiers = skill.milestones.length;
  const isMaxed = tier >= totalTiers;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`border p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${
        isMaxed ? 'border-brand-accent/50 bg-brand-accent/10 shadow-[0_0_20px_rgba(204,70,12,0.15)]' : 'border-brand-border/40 bg-brand-bg/60 hover:border-brand-border shadow-sm'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <ProgressRing progress={progress} size={76} strokeWidth={5}>
          <motion.span 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-2xl"
          >
            {skill.icon}
          </motion.span>
        </ProgressRing>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg truncate text-brand-text">{skill.name}</h3>
            <div className="flex gap-1.5 ml-2 shrink-0">
              {skill.milestones.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-500 shadow-sm ${
                    i < tier ? 'bg-brand-accent shadow-brand-accent/30' : 'bg-brand-border/40'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-brand-text/50 mt-0.5 uppercase tracking-wider font-medium">{skill.subtitle}</p>

          {/* Current value */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums text-brand-text">
              {skill.current}
              <span className="text-xs font-medium text-brand-text/50 ml-1">
                {skill.milestones[0]?.unit}
              </span>
            </span>
            {nextMilestone && !isMaxed && (
              <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-wider">
                → {nextMilestone.target}{nextMilestone.unit} <span className="lowercase font-normal">({nextMilestone.label})</span>
              </span>
            )}
            {isMaxed && (
              <span className="text-[10px] text-brand-accent font-bold uppercase tracking-widest bg-brand-accent/10 px-2 py-0.5 rounded-md">
                Maxed
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-1.5 bg-brand-border/30 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                backgroundColor: isMaxed ? 'var(--brand-accent)' : 'var(--brand-text)',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
