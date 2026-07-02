import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { TrainingLog, Movement, Level, Mechanic } from '../lib/db';
import { buildSkills } from '../lib/progression';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

interface RoadmapProps {
  openLogger?: (config: { isExam: boolean, movement: Movement, level: Level, mechanic: Mechanic, targetUnit: 's'|'reps', targetValue: number }) => void;
}

export default function Roadmap({ openLogger }: RoadmapProps) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  const skills = buildSkills(logs);

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="px-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Roadmap</h1>
        <p className="text-sm text-brand-text/60">Ton plan de bataille actuel.</p>
      </div>
      
      <div className="px-5 mt-4">
        <h2 className="font-serif text-xl font-bold mb-1">Roadmap (2026-2028)</h2>
        <p className="text-xs text-brand-text/50 mb-6">La voie de la maîtrise. Passe les examens pour débloquer les paliers suivants.</p>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8 pb-10"
        >
          {skills.map(skill => (
            <motion.div key={skill.id} variants={itemVariants} className="relative">
              {/* Skill Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">{skill.name}</h3>
                  <p className="text-[10px] text-brand-text/40 tracking-widest">{skill.subtitle}</p>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div className="ml-4 pl-4 border-l-2 border-brand-border/40 flex flex-col gap-6 relative">
                {skill.milestones.map((m, i) => {
                  const isPassed = m.unlocked;
                  // For UI: if the previous is passed, this one is "Current Goal"
                  const isCurrentTarget = !m.unlocked && (i === 0 || skill.milestones[i - 1].unlocked);

                  return (
                    <motion.div key={i} variants={itemVariants} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 transition-colors duration-500 ${
                        isPassed ? 'bg-brand-accent border-brand-accent' :
                        isCurrentTarget ? 'bg-brand-bg border-brand-accent' :
                        'bg-brand-bg border-brand-border'
                      }`} />

                      {/* Content Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          isPassed ? 'border-brand-accent/30 bg-brand-accent/5' :
                          isCurrentTarget ? 'border-brand-text/30 bg-brand-bg shadow-sm' :
                          'border-brand-border/40 bg-brand-bg/50 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPassed ? <CheckCircle size={14} className="text-brand-accent" /> :
                             isCurrentTarget ? <Unlock size={14} className="text-brand-text" /> :
                             <Lock size={14} className="text-brand-text/40" />}
                            <span className="font-bold text-sm">{m.label}</span>
                          </div>
                          <span className={`font-bold tabular-nums ${isPassed ? 'text-brand-accent' : 'text-brand-text'}`}>
                            {m.target}<span className="text-[10px] font-normal ml-0.5">{m.unit}</span>
                          </span>
                        </div>
                        {isCurrentTarget && skill.isExamAvailable && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3"
                          >
                            <button
                              onClick={() => openLogger?.({
                                isExam: true,
                                movement: skill.movement as Movement,
                                level: skill.level as Level,
                                mechanic: skill.mechanic as Mechanic,
                                targetUnit: m.unit,
                                targetValue: m.target
                              })}
                              className="w-full bg-brand-accent text-brand-bg py-2 rounded uppercase tracking-widest font-bold text-[10px] flex items-center justify-center gap-2 shadow-sm"
                            >
                              🎓 Passer l'Examen ({m.target}{m.unit})
                            </button>
                          </motion.div>
                        )}
                        {isCurrentTarget && !skill.isExamAvailable && (
                          <div className="mt-2 w-full h-1 bg-brand-border/40 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((skill.current / m.target) * 100, 100)}%` }}
                              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                              className="h-full bg-brand-text rounded-full"
                            />
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
