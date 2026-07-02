import { useState } from 'react';
import { db } from '../lib/db';
import type { CycleType, Movement, Mechanic, Level } from '../lib/db';
import { X } from 'lucide-react';

interface LogModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CYCLE_TYPES: CycleType[] = ['Force', 'Volume', 'Décharge'];
const MOVEMENTS: Movement[] = ['Front Lever', 'Planche', 'Handstand', 'Accessoire'];
const MECHANICS: Mechanic[] = ['Hold', 'Pull', 'Negative', 'Raise'];
const LEVELS: Level[] = ['Tuck', 'Adv Tuck', 'Half Lay', 'Full'];

export default function LogModal({ onClose, onSave }: LogModalProps) {
  const [cycleType, setCycleType] = useState<CycleType>('Force');
  const [movement, setMovement] = useState<Movement>('Front Lever');
  const [mechanic, setMechanic] = useState<Mechanic>('Hold');
  const [level, setLevel] = useState<Level>('Full');
  const [performance, setPerformance] = useState('');
  const [energy, setEnergy] = useState<number>(7);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!performance.trim()) return;

    db.addLog({
      cycle_type: cycleType,
      movement,
      mechanic,
      level,
      top_set_performance: performance,
      energy_level: energy,
      notes,
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-brand-bg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-brand-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-serif font-bold text-xl">Log Top Set</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-brand-text/40 hover:text-brand-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-5">

          {/* Cycle Type - Chip selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Cycle</label>
            <div className="flex gap-2">
              {CYCLE_TYPES.map(c => (
                <button
                  key={c}
                  onClick={() => setCycleType(c)}
                  className={`flex-1 py-2.5 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all duration-200 ${
                    cycleType === c
                      ? 'bg-brand-text text-brand-bg border-brand-text'
                      : 'border-brand-border text-brand-text/50 hover:border-brand-text/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Movement - Chip selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Movement</label>
            <div className="grid grid-cols-2 gap-2">
              {MOVEMENTS.map(m => (
                <button
                  key={m}
                  onClick={() => setMovement(m)}
                  className={`py-2.5 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all duration-200 ${
                    movement === m
                      ? 'bg-brand-text text-brand-bg border-brand-text'
                      : 'border-brand-border text-brand-text/50 hover:border-brand-text/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mechanic + Level side by side chips */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Mechanic</label>
              <div className="flex flex-col gap-1.5">
                {MECHANICS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMechanic(m)}
                    className={`py-2 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all duration-200 ${
                      mechanic === m
                        ? 'bg-brand-text text-brand-bg border-brand-text'
                        : 'border-brand-border text-brand-text/50 hover:border-brand-text/30'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Level</label>
              <div className="flex flex-col gap-1.5">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all duration-200 ${
                      level === l
                        ? 'bg-brand-text text-brand-bg border-brand-text'
                        : 'border-brand-border text-brand-text/50 hover:border-brand-text/30'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Performance - Hero input */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest block mb-2">
              Top Set Performance
            </label>
            <input
              type="text"
              value={performance}
              onChange={(e) => setPerformance(e.target.value)}
              placeholder='Ex: 3s ou 5 reps @ +10kg'
              className="w-full p-3.5 bg-transparent border-2 border-brand-accent/60 rounded-lg outline-none font-bold text-lg text-brand-accent placeholder:text-brand-accent/25 focus:border-brand-accent transition-colors"
            />
          </div>

          {/* Energy Slider */}
          <div>
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest flex justify-between mb-3">
              <span>Readiness</span>
              <span className="text-sm font-bold text-brand-text">{energy}<span className="text-brand-text/30 font-normal">/10</span></span>
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setEnergy(i + 1)}
                  className={`flex-1 h-8 rounded transition-all duration-200 ${
                    i < energy
                      ? energy >= 8 ? 'bg-brand-accent' : energy >= 5 ? 'bg-brand-text' : 'bg-brand-text/40'
                      : 'bg-brand-border/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="pb-2">
            <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sensations, douleurs, ajustements..."
              className="w-full p-3 bg-transparent border border-brand-border rounded-lg outline-none min-h-[70px] text-sm resize-none focus:border-brand-text/30 transition-colors placeholder:text-brand-text/25"
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-brand-border">
          <button
            onClick={handleSave}
            disabled={!performance.trim()}
            className="w-full bg-brand-accent text-brand-bg font-bold py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            Save Performance
          </button>
        </div>
      </div>
    </div>
  );
}
