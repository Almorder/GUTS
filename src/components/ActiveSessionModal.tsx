import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Timer, ArrowRight, Play } from 'lucide-react';
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

function playBeep() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5); // 500ms beep
  } catch (e) {
    // Ignore if audio not supported
  }
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
  const initialSets: ActiveSet[] = session.structured_focus && session.structured_focus.length > 0 
    ? session.structured_focus.map(s => ({
        ...s,
        // Preserve scheduler targets — DO NOT overwrite with s.reps/s.duration (which are 0)
        targetReps: s.targetReps ?? s.reps ?? 0,
        targetDuration: s.targetDuration ?? s.duration ?? 0,
        targetWeight: s.targetWeight ?? s.weight ?? 0,
        // Zero out actual performance (user will fill these in)
        reps: 0,
        duration: 0,
        weight: s.weight || 0,
      }))
    : [{ movement: 'Front Lever' as any, mechanic: 'Hold' as any, level: 'Tuck' as any, reps: 0, duration: 0, weight: 0, targetDuration: 5 }];

  const [activeSets, setActiveSets] = useState<ActiveSet[]>(initialSets);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [energy, setEnergy] = useState(7);
  const [saved, setSaved] = useState(false);

  const currentSet = activeSets[currentIndex];
  const isFinished = currentIndex >= activeSets.length;

  // Rest Timer Logic
  useEffect(() => {
    let interval: number;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            haptic.success(); // Vibrate when rest is over
            playBeep(); // Play sound
            setIsResting(false);
            setCurrentIndex(idx => idx + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
      setCurrentIndex(idx => idx + 1);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const updateCurrentSet = (updates: Partial<ActiveSet>) => {
    const newSets = [...activeSets];
    newSets[currentIndex] = { ...newSets[currentIndex], ...updates };
    setActiveSets(newSets);
  };

  const handleCompleteSet = () => {
    if (currentSet.isSuperSet || !currentSet.targetRest) {
      // Direct to next set
      setCurrentIndex(prev => prev + 1);
    } else {
      // Go to rest
      setRestTimeLeft(currentSet.targetRest);
      setIsResting(true);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSave = () => {
    const validSets = activeSets.filter(s => s.reps > 0 || s.duration > 0 || s.weight > 0);
    
    db.addLog({
      cycle_type: cycleType,
      is_exam: false,
      energy_level: energy,
      tags: ['✅ Planner Session'],
      sets: validSets.map(({ targetReps, targetDuration, targetWeight, ...rest }) => rest),
    });

    haptic.success();
    setSaved(true);
    setTimeout(() => {
      onSave();
    }, 800);
  };

  const progress = isFinished ? 100 : Math.round((currentIndex / activeSets.length) * 100);

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
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text/50">Progression globale</span>
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

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col custom-scrollbar relative">
          <AnimatePresence mode="wait">
            
            {/* 1. RESTING VIEW */}
            {isResting && (
              <motion.div
                key="resting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center flex-1 py-10"
              >
                <div className="text-[10px] uppercase font-bold tracking-widest text-brand-accent mb-6">Récupération</div>
                
                <div className="relative w-48 h-48 rounded-full border-4 border-brand-accent/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(204,70,12,0.1)]">
                  <div className="text-6xl font-bold tabular-nums text-brand-text tracking-tighter">
                    {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {currentIndex + 1 < activeSets.length && (
                  <div className="bg-brand-text/5 p-4 rounded-2xl w-full text-center border border-brand-border/30">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text/50 block mb-1">Ensuite</span>
                    <span className="font-bold text-lg text-brand-text block">{activeSets[currentIndex + 1].movement}</span>
                    <span className="text-xs text-brand-text/60 font-medium">{activeSets[currentIndex + 1].mechanic} · {activeSets[currentIndex + 1].level}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. WORKOUT VIEW */}
            {!isResting && !isFinished && (
              <motion.div
                key="workout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text/50 bg-brand-text/5 px-3 py-1.5 rounded-md">
                    Série {currentIndex + 1} / {activeSets.length}
                  </span>
                  {currentSet.isSuperSet && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-md flex items-center gap-1">
                      <ArrowRight size={12} /> SuperSet
                    </span>
                  )}
                </div>

                <div className="text-center mb-8">
                  <h3 className="font-serif font-bold text-4xl mb-2 tracking-tight">{currentSet.movement}</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-text/50">{currentSet.mechanic} · {currentSet.level}</p>
                </div>

                <div className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm mb-6">
                  <div className="text-center mb-5">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-block ${currentSet.isAmrap ? 'bg-orange-500/10 text-orange-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
                      {currentSet.isAmrap ? '🔥 AMRAP (Max Reps/Temps)' : 'Objectif du Coach'} : {currentSet.targetReps ? `${currentSet.targetReps}r` : ''} {currentSet.targetDuration ? `${currentSet.targetDuration}s` : ''} {currentSet.targetWeight ? `+${currentSet.targetWeight}kg` : ''}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {currentSet.mechanic !== 'Hold' && (
                      <MetricAdjuster
                        label="Reps"
                        value={currentSet.reps}
                        target={currentSet.targetReps}
                        onChange={(v) => updateCurrentSet({ reps: Math.max(0, v) })}
                        step={1}
                      />
                    )}
                    {currentSet.mechanic === 'Hold' && (
                      <MetricAdjuster
                        label="Temps (s)"
                        value={currentSet.duration}
                        target={currentSet.targetDuration}
                        onChange={(v) => updateCurrentSet({ duration: Math.max(0, v) })}
                        step={1}
                        hasTimer
                      />
                    )}
                    <MetricAdjuster
                      label="Lest (kg)"
                      value={currentSet.weight}
                      onChange={(v) => updateCurrentSet({ weight: v })}
                      step={2.5}
                      format={(v) => v > 0 ? `+${v}` : `${v}`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. FINISHED VIEW */}
            {isFinished && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col flex-1 items-center justify-center py-6"
              >
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="font-serif font-bold text-3xl mb-2 text-center">Séance Terminée</h3>
                <p className="text-sm text-brand-text/60 text-center mb-10">Bravo, tous les blocs ont été complétés.</p>

                <div className="w-full bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm">
                  <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest flex justify-between mb-4">
                    <span>Niveau d'Énergie Final</span>
                    <span className="text-sm font-bold text-brand-text">{energy}<span className="text-brand-text/30 font-normal">/10</span></span>
                  </label>
                  <div className="flex items-center gap-1.5 h-14">
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
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-brand-border/50 bg-brand-bg/95 backdrop-blur-md shrink-0 pb-safe">
          {isResting ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSkipRest}
              className="w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 bg-brand-border/30 text-brand-text hover:bg-brand-border flex items-center justify-center gap-2"
            >
              Passer le repos <Play size={16} />
            </motion.button>
          ) : !isFinished ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteSet}
              className="w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 bg-brand-text text-brand-bg shadow-md flex items-center justify-center gap-2"
            >
              <Check size={18} /> Valider la série
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: saved ? 1 : 0.98 }}
              onClick={handleSave}
              disabled={saved}
              className={`w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                saved 
                  ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]' 
                  : 'bg-brand-accent text-[#F0EBE2] shadow-[0_4px_20px_rgba(204,70,12,0.3)] disabled:opacity-40'
              }`}
            >
              {saved ? (
                <><Check size={20} strokeWidth={3} /> Enregistré</>
              ) : (
                'Sauvegarder et Quitter'
              )}
            </motion.button>
          )}
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
    <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${isComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-brand-text/5 border-brand-border/30'}`}>
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
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-2xl font-medium shadow-sm"
        >
          -
        </motion.button>
        <motion.span
          key={value}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`w-14 text-center font-bold tabular-nums text-2xl tracking-tighter ${isComplete ? 'text-green-500' : 'text-brand-text'}`}
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
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-2xl font-medium shadow-sm"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
