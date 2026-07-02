import { useState } from 'react';
import { db } from '../lib/db';
import type { CycleType, Movement, Mechanic, Level, SubSet } from '../lib/db';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
const MOVEMENTS: Movement[] = ['Front Lever', 'Planche', 'Handstand', 'Accessoire'];
const MECHANICS: Mechanic[] = ['Hold', 'Pull', 'Negative', 'Raise'];
const LEVELS: Level[] = ['Tuck', 'Adv Tuck', 'Half Lay', 'Full'];

const PRESET_TAGS = ['🔥 Forme Parfaite', '💨 Souffle Court', '🏋️ Lourd', '💥 Échec', '🔴 Douleur Lombaire', '🔴 Douleur Poignet', '💪 Elastique'];

export default function LogModal({ config, onClose, onSave }: LogModalProps) {
  const [cycleType, setCycleType] = useState<CycleType>('Force');
  const [energy, setEnergy] = useState<number>(7);
  const [tags, setTags] = useState<string[]>([]);
  const [isExam, setIsExam] = useState(config?.isExam || false);

  const [subsets, setSubsets] = useState<SubSet[]>(() => {
    // Initialize from config if provided
    if (config?.movement) {
      const initialSet: SubSet = {
        movement: config.movement,
        mechanic: config.mechanic || 'Hold',
        level: config.level || 'Full',
        reps: config.targetUnit === 'reps' ? config.targetValue : 0,
        duration: config.targetUnit === 's' ? config.targetValue : 0,
        weight: 0
      };
      return [initialSet];
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
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-brand-bg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[95vh] sm:h-[90vh]"
      >
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-brand-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-xl">{isExam ? '🎓 Examen' : 'Smart Logger'}</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExam(!isExam)}
              className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold transition-colors ${
                isExam ? 'bg-brand-accent text-brand-bg' : 'border border-brand-border text-brand-text/40'
              }`}
            >
              🎓 Exam Mode
            </motion.button>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-brand-text/40 hover:text-brand-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-6">
          
          {/* Top Config */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Cycle</label>
              <div className="flex bg-brand-border/20 p-1 rounded-lg">
                {CYCLE_TYPES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCycleType(c)}
                    className={`relative flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-colors ${
                      cycleType === c ? 'text-brand-text' : 'text-brand-text/40'
                    }`}
                  >
                    {cycleType === c && (
                      <motion.div
                        layoutId="cycle-bg"
                        className="absolute inset-0 bg-brand-bg rounded-md shadow-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Combo Builder Timeline */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Séquence (Combo)</label>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              <AnimatePresence initial={false}>
                {subsets.map((set, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, width: 0, padding: 0, margin: 0 }}
                    onClick={() => setActiveSetIndex(i)}
                    className={`snap-start shrink-0 p-3 rounded-xl border-2 transition-colors cursor-pointer ${
                      activeSetIndex === i ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-bold text-sm">{set.movement}</span>
                      {subsets.length > 1 && activeSetIndex === i && (
                        <button onClick={(e) => { e.stopPropagation(); removeSubSet(i); }} className="text-red-500/50 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-brand-text/50">{set.mechanic} · {set.level}</div>
                    <div className="mt-2 font-bold text-brand-accent tabular-nums">
                      {set.reps ? `${set.reps}r ` : ''}
                      {set.duration ? `${set.duration}s ` : ''}
                      {set.weight ? (set.weight > 0 ? `+${set.weight}kg` : `${set.weight}kg`) : ''}
                      {!set.reps && !set.duration && !set.weight && '0'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSubSet}
                className="shrink-0 flex items-center justify-center w-12 rounded-xl border-2 border-dashed border-brand-border text-brand-text/30 hover:text-brand-accent hover:border-brand-accent transition-colors"
              >
                <Plus size={20} />
              </motion.button>
            </div>
          </div>

          <div className="h-px bg-brand-border/50" />

          {/* Active Set Editor */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSetIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Mouvement</label>
                  <select
                    value={activeSet.movement}
                    onChange={e => updateActiveSet({ movement: e.target.value as Movement })}
                    className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm outline-none"
                  >
                    {MOVEMENTS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Variante</label>
                  <select
                    value={activeSet.level}
                    onChange={e => updateActiveSet({ level: e.target.value as Level })}
                    className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm outline-none"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Mécanique</label>
                <div className="flex flex-wrap gap-2">
                  {MECHANICS.map(m => (
                    <button
                      key={m}
                      onClick={() => updateActiveSet({ mechanic: m })}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all ${
                        activeSet.mechanic === m ? 'bg-brand-text text-brand-bg border-brand-text' : 'border-brand-border text-brand-text/50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest block mb-3">Performance</label>
                <div className="flex flex-col gap-3">
                  <MetricAdjuster
                    label="Répétitions"
                    value={activeSet.reps || 0}
                    onChange={(v) => updateActiveSet({ reps: Math.max(0, v) })} // reps cannot be negative
                    step={1}
                  />
                  <MetricAdjuster
                    label="Temps (sec)"
                    value={activeSet.duration || 0}
                    onChange={(v) => updateActiveSet({ duration: Math.max(0, v) })} // time cannot be negative
                    step={1}
                  />
                  <MetricAdjuster
                    label="Lest / Élast. (kg)"
                    value={activeSet.weight || 0}
                    onChange={(v) => updateActiveSet({ weight: v })} // allow negative for elastics
                    step={2.5}
                    format={(v) => v > 0 ? `+${v}` : `${v}`}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="h-px bg-brand-border/50" />

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Tags Rapides</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    tags.includes(tag) ? 'bg-brand-text text-brand-bg border-brand-text' : 'border-brand-border bg-brand-bg text-brand-text/60'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Energy Slider */}
          <div className="pb-4">
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest flex justify-between mb-3">
              <span>Readiness</span>
              <span className="text-sm font-bold text-brand-text">{energy}<span className="text-brand-text/30 font-normal">/10</span></span>
            </label>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  key={i}
                  onClick={() => setEnergy(i + 1)}
                  className={`flex-1 h-10 rounded-sm transition-colors duration-200 ${
                    i < energy
                      ? energy >= 8 ? 'bg-brand-accent' : energy >= 5 ? 'bg-brand-text' : 'bg-brand-text/40'
                      : 'bg-brand-border/40'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-brand-border bg-brand-bg shrink-0">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!subsets.some(s => (s.reps || 0) > 0 || (s.duration || 0) > 0)}
            className="w-full bg-brand-accent text-brand-bg font-bold py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isExam ? 'Valider l\'Examen' : 'Save Performance'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function MetricAdjuster({ label, value, onChange, step, format }: { label: string, value: number, onChange: (v: number) => void, step: number, format?: (v: number) => string }) {
  return (
    <div className="flex items-center justify-between bg-brand-border/10 p-2 rounded-xl border border-brand-border/50">
      <span className="text-xs font-bold w-28 pl-2">{label}</span>
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(value - step)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-bg border border-brand-border text-lg font-bold"
        >
          -
        </motion.button>
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-12 text-center font-bold tabular-nums text-lg"
        >
          {format ? format(value) : value}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(value + step)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-bg border border-brand-border text-lg font-bold"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
