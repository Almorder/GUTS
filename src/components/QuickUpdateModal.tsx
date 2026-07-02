import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { db } from '../lib/db';
import { haptic } from '../lib/haptics';
import type { Skill } from '../lib/progression';

interface QuickUpdateProps {
  skill: Skill;
  onClose: () => void;
  onSave: () => void;
}

export default function QuickUpdateModal({ skill, onClose, onSave }: QuickUpdateProps) {
  const [value, setValue] = useState(skill.current);
  const [saved, setSaved] = useState(false);

  // We need to know if we are tracking reps or seconds
  const unit = skill.milestones[0]?.unit || 'reps';
  const nextTarget = skill.milestones.find(m => !m.unlocked)?.target || 0;

  const handleSave = () => {
    if (value <= skill.current) {
      onClose();
      return; // No improvement
    }

    db.addLog({
      cycle_type: 'Force',
      is_exam: false,
      energy_level: 8,
      tags: ['🚀 Quick Update'],
      sets: [{
        movement: skill.movement as any,
        mechanic: skill.mechanic as any,
        level: skill.level as any || 'Full',
        reps: unit === 'reps' ? value : 0,
        duration: unit === 's' ? value : 0,
        weight: 0
      }]
    });

    haptic.success();
    setSaved(true);
    setTimeout(() => {
      onSave();
    }, 600);
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
        className="relative w-full max-w-sm bg-brand-bg rounded-3xl shadow-2xl overflow-hidden border border-brand-border/30 p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-brand-text/5 rounded-full text-brand-text/60 hover:text-brand-text transition-colors">
          <X size={16} />
        </button>

        <div className="flex flex-col items-center mb-6 pt-2">
          <span className="text-4xl mb-3">{skill.icon}</span>
          <h2 className="font-serif font-bold text-2xl tracking-tight text-center">{skill.name}</h2>
          <p className="text-xs uppercase tracking-widest text-brand-text/50 font-bold mt-1">Mise à jour rapide</p>
        </div>

        <div className="bg-brand-text/5 border border-brand-border/30 rounded-2xl p-4 flex flex-col items-center gap-4 mb-6">
          <div className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest text-center">
            Nouveau Record ({unit === 's' ? 'Secondes' : 'Répétitions'})
            {nextTarget > 0 && <span className="block mt-1 text-brand-accent">Objectif : {nextTarget}{unit}</span>}
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
              <span className={`text-4xl font-bold tabular-nums tracking-tighter ${value >= nextTarget && nextTarget > 0 ? 'text-green-500' : 'text-brand-text'}`}>
                {value}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setValue(value + 1);
                haptic.light();
                if (nextTarget > 0 && value + 1 === nextTarget) haptic.success();
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-2xl font-medium shadow-sm"
            >
              +
            </motion.button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: saved ? 1 : 0.98 }}
          onClick={handleSave}
          disabled={saved}
          className={`w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            saved 
              ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]' 
              : 'bg-brand-accent text-[#F0EBE2] shadow-[0_4px_20px_rgba(204,70,12,0.3)] disabled:opacity-40 disabled:shadow-none'
          }`}
        >
          {saved ? (
            <><Check size={20} strokeWidth={3} /> Enregistré</>
          ) : (
            'Sauvegarder PR'
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
