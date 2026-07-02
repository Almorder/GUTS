import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Timer } from 'lucide-react';
import { db } from '../lib/db';
import { haptic } from '../lib/haptics';
import type { SubSet, CycleType } from '../lib/db';

export interface ActiveSessionProps {
  session: {
    day: string;
    hour: string;
    focus: string[];
    structured_focus?: SubSet[];
  };
  cycleType: CycleType;
  onClose: () => void;
  onSave: () => void;
}

interface ActiveSet extends SubSet {
  targetReps?: number;
  targetDuration?: number;
  targetWeight?: number;
  reps: number;
  duration: number;
  weight: number;
}

export default function ActiveSessionModal({ session, cycleType, onClose, onSave }: ActiveSessionProps) {
  // If no structured_focus is available, fallback to a single Front Lever hold to prevent crash
  const initialSets: ActiveSet[] = session.structured_focus && session.structured_focus.length > 0 
    ? session.structured_focus.map(s => ({ ...s, targetReps: s.reps, targetDuration: s.duration, targetWeight: s.weight, reps: 0, duration: 0, weight: s.weight || 0 }))
    : [{ movement: 'Front Lever' as any, mechanic: 'Hold' as any, level: 'Full' as any, reps: 0, duration: 0, weight: 0, targetDuration: 5 }];

  const [activeSets, setActiveSets] = useState<ActiveSet[]>(initialSets);
  const [energy, setEnergy] = useState(7);
  const [saved, setSaved] = useState(false);

  const updateSet = (index: number, updates: Partial<typeof activeSets[0]>) => {
    const newSets = [...activeSets];
    newSets[index] = { ...newSets[index], ...updates };
    setActiveSets(newSets);
  };

  const handleSave = () => {
    // Only save sets where the user actually did something
    const validSets = activeSets.filter(s => s.reps > 0 || s.duration > 0 || s.weight > 0);
    
    db.addLog({
      cycle_type: cycleType,
      is_exam: false,
      energy_level: energy,
      tags: ['✅ Planner Session'],
      sets: validSets.map(({ targetReps, targetDuration, targetWeight, ...rest }) => rest), // remove targets
    });

    haptic.success();
    setSaved(true);
    setTimeout(() => {
      onSave();
    }, 800);
  };

  const calculateProgress = () => {
    let totalTarget = 0;
    let totalActual = 0;

    activeSets.forEach(s => {
      if (s.targetReps) {
        totalTarget += s.targetReps;
        totalActual += Math.min(s.reps, s.targetReps);
      }
      if (s.targetDuration) {
        totalTarget += s.targetDuration;
        totalActual += Math.min(s.duration, s.targetDuration);
      }
    });

    if (totalTarget === 0) return 0;
    return Math.min(Math.round((totalActual / totalTarget) * 100), 100);
  };

  const progress = calculateProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-brand-bg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[95vh] sm:h-[90vh] overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-brand-border/50" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-brand-border/20">
          <div className="flex flex-col">
            <h2 className="font-serif font-bold text-2xl tracking-tight">Active Session</h2>
            <span className="text-[10px] uppercase tracking-widest text-brand-text/50 font-bold">{session.day} · {session.hour}</span>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 bg-brand-text/5 rounded-full text-brand-text/60 hover:text-brand-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="px-5 py-4 bg-brand-text/5 border-b border-brand-border/20 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text/50">Progression</span>
            <span className="text-sm font-bold text-brand-accent">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-brand-border/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-accent rounded-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-8 custom-scrollbar">
          {activeSets.map((set, i) => (
            <div key={i} className="bg-brand-bg border border-brand-border/50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-brand-text">{set.movement}</span>
                  <span className="text-[10px] uppercase tracking-widest text-brand-text/50">{set.mechanic} · {set.level}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-md">
                    Objectif : {set.targetReps ? `${set.targetReps}r` : ''} {set.targetDuration ? `${set.targetDuration}s` : ''} {set.targetWeight ? `+${set.targetWeight}kg` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {set.targetReps !== undefined && set.targetReps > 0 && (
                  <MetricAdjuster
                    label="Répétitions"
                    value={set.reps}
                    target={set.targetReps}
                    onChange={(v) => updateSet(i, { reps: Math.max(0, v) })}
                    step={1}
                  />
                )}
                {set.targetDuration !== undefined && set.targetDuration > 0 && (
                  <MetricAdjuster
                    label="Temps (sec)"
                    value={set.duration}
                    target={set.targetDuration}
                    onChange={(v) => updateSet(i, { duration: Math.max(0, v) })}
                    step={1}
                    hasTimer
                  />
                )}
                <MetricAdjuster
                  label="Lest (kg)"
                  value={set.weight}
                  onChange={(v) => updateSet(i, { weight: v })}
                  step={2.5}
                  format={(v) => v > 0 ? `+${v}` : `${v}`}
                />
              </div>
            </div>
          ))}

          {/* Energy Slider */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest flex justify-between mb-3">
              <span>Niveau d'Énergie en fin de séance</span>
              <span className="text-sm font-bold text-brand-text">{energy}<span className="text-brand-text/30 font-normal">/10</span></span>
            </label>
            <div className="flex items-center gap-1.5 h-12">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  key={i}
                  onClick={() => {
                    setEnergy(i + 1);
                    haptic.light();
                  }}
                  className={`flex-1 h-full rounded-md transition-colors duration-200 ${
                    i < energy
                      ? energy >= 8 ? 'bg-brand-accent' : energy >= 5 ? 'bg-brand-text' : 'bg-brand-text/60'
                      : 'bg-brand-text/10'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-brand-border/50 bg-brand-bg/95 backdrop-blur-md shrink-0 pb-safe">
          <motion.button
            whileTap={{ scale: saved ? 1 : 0.98 }}
            onClick={handleSave}
            disabled={progress === 0 || saved}
            className={`w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              saved 
                ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]' 
                : 'bg-brand-accent text-[#F0EBE2] shadow-[0_4px_20px_rgba(204,70,12,0.3)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed'
            }`}
          >
            {saved ? (
              <><Check size={20} strokeWidth={3} /> Enregistré</>
            ) : (
              'Valider la Séance'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function MetricAdjuster({ label, value, target, onChange, step, format, hasTimer }: { label: string, value: number, target?: number, onChange: (v: number) => void, step: number, format?: (v: number) => string, hasTimer?: boolean }) {
  const [isTiming, setIsTiming] = useState(false);
  
  useEffect(() => {
    let interval: number;
    if (isTiming) {
      interval = setInterval(() => {
        onChange(value + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming, value, onChange]);

  const isComplete = target !== undefined && value >= target && target > 0;

  return (
    <div className={`flex items-center justify-between p-2 rounded-2xl border transition-colors ${isComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-brand-text/5 border-brand-border/30'}`}>
      <div className="flex items-center gap-2 pl-2">
        <span className="text-xs font-bold w-20 text-brand-text/80">{label}</span>
        {hasTimer && (
          <button 
            onClick={() => setIsTiming(!isTiming)}
            className={`p-1.5 rounded-lg transition-colors ${isTiming ? 'bg-red-500/20 text-red-500' : 'bg-brand-text/10 text-brand-text/50'}`}
          >
            <Timer size={16} className={isTiming ? 'animate-pulse' : ''} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onChange(value - step);
            haptic.light();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-xl font-medium shadow-sm"
        >
          -
        </motion.button>
        <motion.span
          key={value}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`w-12 text-center font-bold tabular-nums text-xl ${isComplete ? 'text-green-500' : 'text-brand-text'}`}
        >
          {format ? format(value) : value}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const nextValue = value + step;
            onChange(nextValue);
            haptic.light();
            if (target && nextValue === target) haptic.success();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-xl font-medium shadow-sm"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
