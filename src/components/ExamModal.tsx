import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trophy } from 'lucide-react';
import { db } from '../lib/db';
import { haptic } from '../lib/haptics';
import type { Skill } from '../lib/progression';

interface ExamModalProps {
  skills: Skill[];
  onClose: () => void;
  onSave: () => void;
}

export default function ExamModal({ skills, onClose, onSave }: ExamModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [value, setValue] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setValue(skill.current); // Start at current PR
    haptic.light();
  };

  const handleSave = () => {
    if (!selectedSkill) return;
    const unit = selectedSkill.milestones[0]?.unit || 'reps';

    db.addLog({
      cycle_type: 'Force', // default
      is_exam: true, // IMPORTANT
      energy_level: 10,
      tags: ['🎓 Exam Passed'],
      sets: [{
        movement: selectedSkill.movement as any,
        mechanic: selectedSkill.mechanic as any,
        level: selectedSkill.level as any || 'Full',
        reps: unit === 'reps' ? value : 0,
        duration: unit === 's' ? value : 0,
        weight: 0
      }]
    });

    haptic.success();
    setSaved(true);
    setTimeout(() => {
      onSave();
    }, 800);
  };

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
        className="relative w-full max-w-sm bg-brand-bg rounded-3xl shadow-[0_0_50px_rgba(204,70,12,0.15)] overflow-hidden border border-brand-accent/30 p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-brand-text/5 rounded-full text-brand-text/60 hover:text-brand-text transition-colors">
          <X size={16} />
        </button>

        <div className="flex flex-col items-center mb-6 pt-2">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4 border border-brand-accent/20">
            <Trophy size={32} className="text-brand-accent" />
          </div>
          <h2 className="font-serif font-bold text-2xl tracking-tight text-center">Exam Mode</h2>
          <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mt-1">Valide tes paliers</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedSkill ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-3"
            >
              <p className="text-xs text-brand-text/60 text-center mb-2">Sélectionne l'examen à passer :</p>
              {skills.map(skill => {
                const nextTarget = skill.milestones.find(m => !m.unlocked);
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSelectSkill(skill)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <span className="font-bold text-brand-text block">{skill.name}</span>
                        <span className="text-[10px] uppercase font-bold text-brand-text/50">Cible: {nextTarget?.target}{nextTarget?.unit}</span>
                      </div>
                    </div>
                    <span className="text-brand-accent font-bold">GO</span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <span className="text-3xl mb-2 block">{selectedSkill.icon}</span>
                <span className="font-bold text-lg">{selectedSkill.name}</span>
              </div>

              {(() => {
                const unit = selectedSkill.milestones[0]?.unit || 'reps';
                const nextTarget = selectedSkill.milestones.find(m => !m.unlocked)?.target || 0;
                const isPassed = value >= nextTarget;

                return (
                  <div className={`w-full p-6 rounded-2xl border transition-colors flex flex-col items-center gap-6 ${isPassed ? 'bg-green-500/10 border-green-500/30' : 'bg-brand-text/5 border-brand-border/30'}`}>
                    <div className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest text-center">
                      Objectif pour valider :
                      <span className="block mt-1 text-brand-accent text-lg">{nextTarget}{unit}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setValue(Math.max(0, value - 1));
                          haptic.light();
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-2xl font-medium shadow-sm"
                      >
                        -
                      </motion.button>
                      
                      <div className="w-20 text-center">
                        <span className={`text-4xl font-bold tabular-nums tracking-tighter ${isPassed ? 'text-green-500' : 'text-brand-text'}`}>
                          {value}
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setValue(value + 1);
                          haptic.light();
                          if (value + 1 === nextTarget) haptic.success();
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-2xl font-medium shadow-sm"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                );
              })()}

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setSelectedSkill(null)} 
                  className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/60 bg-brand-border/20 rounded-2xl"
                >
                  Retour
                </button>
                <motion.button
                  whileTap={{ scale: saved ? 1 : 0.98 }}
                  onClick={handleSave}
                  disabled={saved || value < (selectedSkill.milestones.find(m => !m.unlocked)?.target || 0)}
                  className={`flex-[2] font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    saved 
                      ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]' 
                      : 'bg-brand-accent text-[#F0EBE2] shadow-[0_4px_20px_rgba(204,70,12,0.3)] disabled:opacity-40 disabled:shadow-none'
                  }`}
                >
                  {saved ? (
                    <><Check size={20} strokeWidth={3} /> Validé</>
                  ) : (
                    'Confirmer'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
