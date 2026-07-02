import type { Skill } from '../lib/progression';
import { getSkillProgress, getNextMilestone, getCurrentTier } from '../lib/progression';
import ProgressRing from './ProgressRing';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const progress = getSkillProgress(skill);
  const nextMilestone = getNextMilestone(skill);
  const tier = getCurrentTier(skill);
  const totalTiers = skill.milestones.length;
  const isMaxed = tier >= totalTiers;

  return (
    <div className="border border-brand-border p-4 rounded-lg bg-brand-bg hover:shadow-sm transition-shadow duration-300 group">
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <ProgressRing progress={progress} size={72} strokeWidth={4}>
          <span className="text-xl">{skill.icon}</span>
        </ProgressRing>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base truncate">{skill.name}</h3>
            <div className="flex gap-1 ml-2 shrink-0">
              {skill.milestones.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    i < tier ? 'bg-brand-accent' : 'bg-brand-border'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-brand-text/50 mt-0.5">{skill.subtitle}</p>

          {/* Current value */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums">
              {skill.current}
              <span className="text-xs font-normal text-brand-text/50 ml-0.5">
                {skill.milestones[0]?.unit}
              </span>
            </span>
            {nextMilestone && !isMaxed && (
              <span className="text-xs text-brand-text/40">
                → {nextMilestone.target}{nextMilestone.unit} ({nextMilestone.label})
              </span>
            )}
            {isMaxed && (
              <span className="text-xs text-brand-accent font-bold uppercase tracking-wider">
                Maxed
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full h-1 bg-brand-border/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: isMaxed ? '#CC460C' : '#050403',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
