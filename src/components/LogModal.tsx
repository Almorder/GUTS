import { useState } from 'react';
import { db } from '../lib/db';
import type { CycleType, Movement, Mechanic, Level } from '../lib/db';
import { X } from 'lucide-react';

interface LogModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function LogModal({ onClose, onSave }: LogModalProps) {
  const [cycleType, setCycleType] = useState<CycleType>('Force');
  const [movement, setMovement] = useState<Movement>('Front Lever');
  const [mechanic, setMechanic] = useState<Mechanic>('Hold');
  const [level, setLevel] = useState<Level>('Tuck');
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
      notes
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-text/20 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md bg-brand-bg h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="font-serif font-bold text-xl">Log Top Set</h2>
          <button onClick={onClose} className="p-2 text-brand-text/60 hover:text-brand-text">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          <div className="flex gap-2">
            {(['Force', 'Volume', 'Décharge'] as CycleType[]).map(c => (
              <button
                key={c}
                onClick={() => setCycleType(c)}
                className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold border ${cycleType === c ? 'bg-brand-text text-brand-bg border-brand-text' : 'border-brand-border text-brand-text/60'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-brand-text/60 tracking-wider">Movement</label>
            <select 
              value={movement} 
              onChange={(e) => setMovement(e.target.value as Movement)}
              className="w-full p-3 bg-transparent border border-brand-border outline-none font-bold appearance-none rounded-sm"
            >
              <option>Front Lever</option>
              <option>Planche</option>
              <option>Handstand</option>
              <option>Accessoire</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-brand-text/60 tracking-wider">Mechanic</label>
              <select 
                value={mechanic} 
                onChange={(e) => setMechanic(e.target.value as Mechanic)}
                className="w-full p-3 bg-transparent border border-brand-border outline-none font-bold appearance-none rounded-sm"
              >
                <option>Hold</option>
                <option>Pull</option>
                <option>Negative</option>
                <option>Raise</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-brand-text/60 tracking-wider">Level</label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value as Level)}
                className="w-full p-3 bg-transparent border border-brand-border outline-none font-bold appearance-none rounded-sm"
              >
                <option>Tuck</option>
                <option>Adv Tuck</option>
                <option>Half Lay</option>
                <option>Full</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-brand-accent tracking-wider">Top Set Performance</label>
            <input 
              type="text" 
              value={performance}
              onChange={(e) => setPerformance(e.target.value)}
              placeholder="Ex: 3s ou 2 reps @ +10kg"
              className="w-full p-3 bg-transparent border border-brand-accent outline-none font-bold text-brand-accent placeholder:text-brand-accent/30 rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-brand-text/60 tracking-wider flex justify-between">
              <span>Readiness (Energy)</span>
              <span>{energy} / 10</span>
            </label>
            <input 
              type="range" 
              min="1" max="10" 
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full accent-brand-accent"
            />
          </div>

          <div className="flex flex-col gap-2 pb-6">
            <label className="text-xs uppercase font-bold text-brand-text/60 tracking-wider">Notes & Alertes Lombaires</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sensations, douleurs, ajustements..."
              className="w-full p-3 bg-transparent border border-brand-border outline-none min-h-[80px] text-sm resize-none rounded-sm"
            />
          </div>

        </div>

        <div className="p-4 border-t border-brand-border">
          <button 
            onClick={handleSave}
            disabled={!performance.trim()}
            className="w-full bg-brand-text text-brand-bg font-bold py-4 rounded-sm uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Performance
          </button>
        </div>

      </div>
    </div>
  );
}
