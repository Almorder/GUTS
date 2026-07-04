import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Unlock, CheckCircle, ChevronRight, Edit3 } from 'lucide-react';
import type { TrainingLog, SubSet, Movement, Mechanic, Level } from '../lib/db';
import type { Skill } from '../lib/progression';

interface SkillDetailProps {
  skill: Skill;
  logs: TrainingLog[];
  onClose: () => void;
  onEditLog?: (log: TrainingLog) => void;
  openLogger?: (config: { isExam: boolean, movement: Movement, level: Level, mechanic: Mechanic, targetUnit: 's'|'reps', targetValue: number }) => void;
}

export default function SkillDetailModal({ skill, logs, onClose, onEditLog, openLogger }: SkillDetailProps) {
  // Filter logs for this specific skill/movement
  const skillLogs = useMemo(() => {
    return logs.filter(log => {
      if (!log.sets) return false;
      return log.sets.some(s => s.movement === skill.movement && s.mechanic === skill.mechanic);
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [logs, skill]);

  const unit = skill.milestones[0]?.unit || 'reps';
  
  // Find current active tier label
  const activeMilestone = skill.milestones.find(m => !m.unlocked) || skill.milestones[skill.milestones.length - 1];

  function formatPerformance(s: SubSet) {
    const parts = [];
    if (s.reps) parts.push(`${s.reps}r`);
    if (s.duration) parts.push(`${s.duration}s`);
    if (s.weight) parts.push(`${s.weight > 0 ? '+' : ''}${s.weight}kg`);
    return parts.join(' ') || '0';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md max-h-[90vh] bg-brand-bg rounded-3xl shadow-2xl overflow-hidden border border-brand-border/30 flex flex-col"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-brand-text/5 rounded-full text-brand-text/60 hover:text-brand-text transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-6 pb-2 shrink-0 border-b border-brand-border/20">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{skill.icon}</span>
            <div>
              <h2 className="font-serif font-bold text-2xl tracking-tight">{skill.name}</h2>
              <p className="text-xs uppercase tracking-widest text-brand-text/50 font-bold mt-0.5">{skill.subtitle}</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-end mb-2">
             <span className="text-3xl font-bold tabular-nums leading-none text-brand-text">{skill.current}</span>
             <span className="text-sm font-medium text-brand-text/50 mb-1">{unit}</span>
             <span className="text-xs uppercase font-bold tracking-widest text-brand-accent ml-auto mb-1 flex items-center gap-1">
               {activeMilestone.label} <ChevronRight size={12} />
             </span>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6 flex-1 flex flex-col gap-8">
          
          {/* Progression Timeline */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/40 mb-4 flex items-center gap-2">
              <div className="h-px bg-brand-border/40 flex-1" />
              Roadmap
              <div className="h-px bg-brand-border/40 flex-1" />
            </h3>
            <div className="flex flex-col gap-3">
              {skill.milestones.map((m, i) => {
                const isPassed = m.unlocked;
                const isCurrentTarget = !m.unlocked && (i === 0 || skill.milestones[i - 1].unlocked);
                
                return (
                  <div key={i} className="flex flex-col gap-3">
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isPassed ? 'bg-brand-accent/5 border-brand-accent/30' : 
                      isCurrentTarget ? 'bg-brand-text/5 border-brand-text/30 shadow-sm' : 
                      'bg-brand-bg/50 border-brand-border/30 opacity-50'
                    }`}>
                      <div className="shrink-0">
                        {isPassed ? <CheckCircle size={16} className="text-brand-accent" /> :
                         isCurrentTarget ? <Unlock size={16} className="text-brand-text" /> :
                         <Lock size={16} className="text-brand-text/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-brand-text truncate">{m.label}</div>
                        <div className="text-[10px] text-brand-text/50 uppercase tracking-wider">{m.level}</div>
                      </div>
                      <div className={`font-bold tabular-nums text-right ${isPassed ? 'text-brand-accent' : 'text-brand-text'}`}>
                        {m.target}<span className="text-[10px] ml-0.5">{m.unit}</span>
                      </div>
                    </div>
                    
                    {isCurrentTarget && skill.isExamAvailable && openLogger && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <button
                          onClick={() => {
                            onClose();
                            openLogger({
                              isExam: true,
                              movement: skill.movement as Movement,
                              level: m.level as Level,
                              mechanic: skill.mechanic as Mechanic,
                              targetUnit: m.unit,
                              targetValue: m.target
                            });
                          }}
                          className="w-full bg-brand-accent text-brand-bg py-3 rounded-xl uppercase tracking-widest font-bold text-[10px] flex items-center justify-center gap-2 shadow-sm"
                        >
                          🎓 Passer l'Examen ({m.target}{m.unit})
                        </button>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* History */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/40 mb-4 flex items-center gap-2">
              <div className="h-px bg-brand-border/40 flex-1" />
              Historique
              <div className="h-px bg-brand-border/40 flex-1" />
            </h3>
            
            {skillLogs.length === 0 ? (
              <div className="text-center py-6 text-sm text-brand-text/40">
                Aucun log trouvé pour ce mouvement.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {skillLogs.map(log => {
                  const relevantSets = log.sets!.filter(s => s.movement === skill.movement && s.mechanic === skill.mechanic);
                  return (
                    <div key={log.id} className="relative group p-3 border border-brand-border/40 rounded-xl bg-brand-bg">
                       <div className="flex justify-between items-start mb-2">
                         <div className="text-[10px] uppercase tracking-wider font-bold text-brand-text/40">
                           {new Date(log.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </div>
                         {log.is_exam && <span className="text-[9px] uppercase tracking-widest font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">Exam</span>}
                       </div>
                       
                       <div className="flex flex-col gap-1.5">
                         {relevantSets.map((s, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-brand-text/5 p-2 rounded-lg">
                             <div className="flex gap-2 items-center">
                               <span className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60">{s.level}</span>
                             </div>
                             <span className="font-bold text-sm">{formatPerformance(s)}</span>
                           </div>
                         ))}
                       </div>
                       
                       {onEditLog && (
                         <button 
                           onClick={() => { onClose(); onEditLog(log); }}
                           className="absolute top-2 right-2 p-1.5 text-brand-text/40 hover:text-brand-accent transition-colors"
                         >
                           <Edit3 size={12} />
                         </button>
                       )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
