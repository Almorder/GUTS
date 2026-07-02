import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { CycleType, Movement, Mechanic, Level, SubSet } from '../lib/db';
import { X, Plus, Trash2, Timer, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../lib/haptics';

export interface LogModalConfig {
  isOpen: boolean;
  isExam?: boolean;
  movement?: Movement;
  level?: Level;
  mechanic?: Mechanic;
  targetUnit?: 's' | 'reps';
  targetValue?: number;
}

interface LogModalProps {
  config?: LogModalConfig;
  onClose: () => void;
  onSave: () => void;
}

const CYCLE_TYPES: CycleType[] = ['Force', 'Volume', 'Décharge'];
const MOVEMENTS: Movement[] = ['Front Lever', 'Planche', 'Handstand', 'Tractions', 'Dips', 'L-sit', 'Renforcement', 'Accessoire'];
const MECHANICS: Mechanic[] = ['Hold', 'Pull', 'Negative', 'Raise'];
const LEVELS: Level[] = ['Tuck', 'Adv Tuck', 'Half Lay', 'Full'];

const PRESET_TAGS = ['🔥 Forme Parfaite', '💨 Souffle Court', '🏋️ Lourd', '💥 Échec', '🔴 Lombaire', '🔴 Poignet', '💪 Elastique'];

export default function LogModal({ config, onClose, onSave }: LogModalProps) {
  const [cycleType, setCycleType] = useState<CycleType>('Force');
  const [energy, setEnergy] = useState<number>(7);
  const [tags, setTags] = useState<string[]>([]);
  const [isExam, setIsExam] = useState(config?.isExam || false);
  const [saved, setSaved] = useState(false);

  const [subsets, setSubsets] = useState<SubSet[]>(() => {
    if (config?.movement) {
      return [{
        movement: config.movement,
        mechanic: config.mechanic || 'Hold',
        level: config.level || 'Full',
        reps: config.targetUnit === 'reps' ? config.targetValue : 0,
        duration: config.targetUnit === 's' ? config.targetValue : 0,
        weight: 0
      }];
    }
    return [{ movement: 'Front Lever', mechanic: 'Hold', level: 'Full', reps: 0, duration: 0, weight: 0 }];
  });

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const activeSet = subsets[activeSetIndex];

  const updateActiveSet = (updates: Partial<SubSet>) => {
    const newSets = [...subsets];
    newSets[activeSetIndex] = { ...newSets[activeSetIndex], ...updates };
    setSubsets(newSets);
  };

  const addSubSet = () => {
    setSubsets([...subsets, { movement: 'Accessoire', mechanic: 'Pull', level: 'Full', reps: 0, duration: 0, weight: 0 }]);
    setActiveSetIndex(subsets.length);
  };

  const removeSubSet = (index: number) => {
    if (subsets.length === 1) return;
    const newSets = subsets.filter((_, i) => i !== index);
    setSubsets(newSets);
    setActiveSetIndex(Math.max(0, index - 1));
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = () => {
    const isValid = subsets.some(s => (s.reps || 0) > 0 || (s.duration || 0) > 0);
    if (!isValid) return;

    db.addLog({
      cycle_type: cycleType,
      is_exam: isExam,
      energy_level: energy,
      tags,
      sets: subsets,
    });
    
    haptic.success();
    setSaved(true);
    setTimeout(() => {
      onSave();
    }, 800);
  };

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

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-2xl tracking-tight">{isExam ? '🎓 Examen' : 'Smart Log'}</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExam(!isExam)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                isExam ? 'bg-brand-accent text-[#F0EBE2] shadow-lg shadow-brand-accent/20' : 'border border-brand-border text-brand-text/50 bg-brand-text/5'
              }`}
            >
              🎓 Mode Exam
            </motion.button>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 bg-brand-text/5 rounded-full text-brand-text/60 hover:text-brand-text hover:bg-brand-text/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-8 custom-scrollbar">
          
          {/* Cycle Selection */}
          <div className="pt-2">
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Cycle Actuel</label>
            <div className="flex bg-brand-text/5 p-1.5 rounded-2xl">
              {CYCLE_TYPES.map(c => (
                <button
                  key={c}
                  onClick={() => setCycleType(c)}
                  className={`relative flex-1 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors ${
                    cycleType === c ? 'text-brand-text' : 'text-brand-text/50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {cycleType === c && (
                    <motion.div
                      layoutId="cycle-bg"
                      className="absolute inset-0 bg-brand-bg rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-brand-border/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Super Set Timeline */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Séquence (Super Set)</label>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
              <AnimatePresence initial={false}>
                {subsets.map((set, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, width: 0, padding: 0, margin: 0 }}
                    onClick={() => setActiveSetIndex(i)}
                    className={`snap-start shrink-0 p-4 w-48 rounded-2xl border-2 transition-all cursor-pointer ${
                      activeSetIndex === i ? 'border-brand-accent bg-brand-accent/5 shadow-md shadow-brand-accent/10' : 'border-brand-border bg-brand-text/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-bold text-sm text-brand-text">{set.movement}</span>
                      {subsets.length > 1 && activeSetIndex === i && (
                        <button onClick={(e) => { e.stopPropagation(); removeSubSet(i); }} className="text-red-500/50 hover:text-red-500 p-1 bg-red-500/10 rounded-md">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-brand-text/60 font-medium mb-3">{set.mechanic} · {set.level}</div>
                    <div className="font-bold text-brand-accent tabular-nums flex flex-wrap gap-1">
                      {set.reps ? <span className="bg-brand-accent/10 px-2 py-0.5 rounded-md">{set.reps}r</span> : null}
                      {set.duration ? <span className="bg-brand-accent/10 px-2 py-0.5 rounded-md">{set.duration}s</span> : null}
                      {set.weight ? <span className="bg-brand-accent/10 px-2 py-0.5 rounded-md">{set.weight > 0 ? `+${set.weight}` : set.weight}kg</span> : null}
                      {!set.reps && !set.duration && !set.weight && <span className="text-brand-text/30">0</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSubSet}
                className="shrink-0 flex items-center justify-center w-16 rounded-2xl border-2 border-dashed border-brand-border bg-brand-text/5 text-brand-text/40 hover:text-brand-accent hover:border-brand-accent hover:bg-brand-accent/5 transition-all"
              >
                <Plus size={24} />
              </motion.button>
            </div>
          </div>

          <div className="h-px bg-brand-border/30" />

          {/* Active Set Editor - Zero Typing UI */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSetIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div>
                <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Mouvement</label>
                <PillSelector 
                  options={MOVEMENTS} 
                  selected={activeSet.movement} 
                  onChange={(v) => updateActiveSet({ movement: v as Movement })} 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Variante</label>
                <PillSelector 
                  options={LEVELS} 
                  selected={activeSet.level} 
                  onChange={(v) => updateActiveSet({ level: v as Level })} 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Mécanique</label>
                <PillSelector 
                  options={MECHANICS} 
                  selected={activeSet.mechanic} 
                  onChange={(v) => updateActiveSet({ mechanic: v as Mechanic })} 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest block mb-3">Performance</label>
                <div className="flex flex-col gap-3">
                  <MetricAdjuster
                    label="Répétitions"
                    value={activeSet.reps || 0}
                    onChange={(v) => updateActiveSet({ reps: Math.max(0, v) })}
                    step={1}
                  />
                  <MetricAdjuster
                    label="Temps (sec)"
                    value={activeSet.duration || 0}
                    onChange={(v) => updateActiveSet({ duration: Math.max(0, v) })}
                    step={1}
                    hasTimer
                  />
                  <MetricAdjuster
                    label="Lest / Élast. (kg)"
                    value={activeSet.weight || 0}
                    onChange={(v) => updateActiveSet({ weight: v })}
                    step={2.5}
                    format={(v) => v > 0 ? `+${v}` : `${v}`}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="h-px bg-brand-border/30" />

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Tags Rapides</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
                    tags.includes(tag) ? 'bg-brand-text text-brand-bg border-brand-text shadow-md' : 'border-brand-border/50 bg-brand-text/5 text-brand-text/70'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Energy Slider */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest flex justify-between mb-3">
              <span>Niveau d'Énergie</span>
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
            disabled={!subsets.some(s => (s.reps || 0) > 0 || (s.duration || 0) > 0) || saved}
            className={`w-full font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              saved 
                ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]' 
                : 'bg-brand-accent text-[#F0EBE2] shadow-[0_4px_20px_rgba(204,70,12,0.3)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed'
            }`}
          >
            {saved ? (
              <>
                <Check size={20} strokeWidth={3} />
                Enregistré
              </>
            ) : (
              isExam ? 'Valider l\'Examen' : 'Save Performance'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Helper Components ---

function PillSelector({ options, selected, onChange }: { options: string[], selected: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            selected === opt 
              ? 'bg-brand-text text-brand-bg border-brand-text shadow-md shadow-brand-text/10' 
              : 'border-brand-border/50 bg-brand-text/5 text-brand-text/60 hover:bg-brand-text/10'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MetricAdjuster({ label, value, onChange, step, format, hasTimer }: { label: string, value: number, onChange: (v: number) => void, step: number, format?: (v: number) => string, hasTimer?: boolean }) {
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

  return (
    <div className="flex items-center justify-between bg-brand-text/5 p-2 rounded-2xl border border-brand-border/30">
      <div className="flex items-center gap-2 pl-2">
        <span className="text-xs font-bold w-24 text-brand-text/80">{label}</span>
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
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-xl font-medium shadow-sm"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          -
        </motion.button>
        <motion.span
          key={value}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-14 text-center font-bold tabular-nums text-xl text-brand-text"
        >
          {format ? format(value) : value}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onChange(value + step);
            haptic.light();
          }}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border/50 text-xl font-medium shadow-sm"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
