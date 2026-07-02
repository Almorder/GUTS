import { useState } from 'react';
import { db } from '../lib/db';
import type { CycleType, Movement, Mechanic, Level, SubSet } from '../lib/db';
import { X, Plus, Trash2 } from 'lucide-react';

interface LogModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CYCLE_TYPES: CycleType[] = ['Force', 'Volume', 'Décharge'];
const MOVEMENTS: Movement[] = ['Front Lever', 'Planche', 'Handstand', 'Accessoire'];
const MECHANICS: Mechanic[] = ['Hold', 'Pull', 'Negative', 'Raise'];
const LEVELS: Level[] = ['Tuck', 'Adv Tuck', 'Half Lay', 'Full'];

const PRESET_TAGS = ['🔥 Forme Parfaite', '💨 Souffle Court', '🏋️ Lourd', '💥 Échec', '🔴 Douleur Lombaire', '🔴 Douleur Poignet'];

export default function LogModal({ onClose, onSave }: LogModalProps) {
  const [cycleType, setCycleType] = useState<CycleType>('Force');
  const [energy, setEnergy] = useState<number>(7);
  const [tags, setTags] = useState<string[]>([]);
  const [isExam, setIsExam] = useState(false);

  // Array of subsets to build combos
  const [subsets, setSubsets] = useState<SubSet[]>([
    { movement: 'Front Lever', mechanic: 'Hold', level: 'Full', reps: 0, duration: 0, weight: 0 }
  ]);
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
    // Validate: at least one subset must have performance > 0
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
      <div className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative w-full max-w-md bg-brand-bg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[95vh] sm:h-[90vh] animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-brand-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-xl">Smart Logger</h2>
            <button
              onClick={() => setIsExam(!isExam)}
              className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold transition-colors ${
                isExam ? 'bg-brand-accent text-brand-bg' : 'border border-brand-border text-brand-text/40'
              }`}
            >
              🎓 Exam Mode
            </button>
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
                    className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${
                      cycleType === c ? 'bg-brand-bg text-brand-text shadow-sm' : 'text-brand-text/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Combo Builder Timeline */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Séquence (Combo)</label>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {subsets.map((set, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSetIndex(i)}
                  className={`snap-start shrink-0 p-3 rounded-xl border-2 transition-all cursor-pointer ${
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
                    {set.weight ? `+${set.weight}kg` : ''}
                    {!set.reps && !set.duration && !set.weight && '0'}
                  </div>
                </div>
              ))}
              <button
                onClick={addSubSet}
                className="shrink-0 flex items-center justify-center w-12 rounded-xl border-2 border-dashed border-brand-border text-brand-text/30 hover:text-brand-accent hover:border-brand-accent transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="h-px bg-brand-border/50" />

          {/* Active Set Editor */}
          <div className="flex flex-col gap-5 animate-in fade-in duration-200" key={activeSetIndex}>
            
            {/* Classification */}
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

            {/* Metrics (Zero Typing) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest block mb-3">Performance (Zero-Type)</label>
              <div className="flex flex-col gap-3">
                <MetricAdjuster
                  label="Répétitions"
                  value={activeSet.reps || 0}
                  onChange={(v) => updateActiveSet({ reps: v })}
                  step={1}
                />
                <MetricAdjuster
                  label="Temps (sec)"
                  value={activeSet.duration || 0}
                  onChange={(v) => updateActiveSet({ duration: v })}
                  step={1}
                />
                <MetricAdjuster
                  label="Lest (kg)"
                  value={activeSet.weight || 0}
                  onChange={(v) => updateActiveSet({ weight: v })}
                  step={2.5}
                />
              </div>
            </div>

          </div>

          <div className="h-px bg-brand-border/50" />

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Tags Rapides</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    tags.includes(tag) ? 'bg-brand-text text-brand-bg border-brand-text' : 'border-brand-border bg-brand-bg text-brand-text/60'
                  }`}
                >
                  {tag}
                </button>
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
                <button
                  key={i}
                  onClick={() => setEnergy(i + 1)}
                  className={`flex-1 h-10 rounded-sm transition-all duration-200 ${
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
          <button
            onClick={handleSave}
            disabled={!subsets.some(s => (s.reps || 0) > 0 || (s.duration || 0) > 0)}
            className="w-full bg-brand-accent text-brand-bg font-bold py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            Save Performance
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for zero-typing adjustments
function MetricAdjuster({ label, value, onChange, step }: { label: string, value: number, onChange: (v: number) => void, step: number }) {
  return (
    <div className="flex items-center justify-between bg-brand-border/10 p-2 rounded-xl border border-brand-border/50">
      <span className="text-xs font-bold w-24 pl-2">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-bg border border-brand-border active:bg-brand-border/50 transition-colors"
        >
          -
        </button>
        <span className="w-12 text-center font-bold tabular-nums text-lg">{value}</span>
        <button
          onClick={() => onChange(value + step)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-bg border border-brand-border active:bg-brand-border/50 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
