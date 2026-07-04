import { motion } from 'framer-motion';
import type { BodyState, MuscleGroup, SorenessLevel } from '../lib/db';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { haptic } from '../lib/haptics';

interface BodyMapProps {
  state: BodyState;
  onChange: (newState: BodyState) => void;
}

const MUSCLES: { id: MuscleGroup; label: string; desc: string; icon: string }[] = [
  { id: 'lats', label: 'Dorsaux & Biceps', desc: 'Tirage (Front Lever, Tractions)', icon: '🦇' },
  { id: 'shoulders', label: 'Épaules', desc: 'Équilibre (Planche, Handstand)', icon: '🥥' },
  { id: 'chest', label: 'Pecs & Triceps', desc: 'Poussée (Dips, Planche)', icon: '🛡️' },
  { id: 'core', label: 'Gainage & Lombaires', desc: 'Stabilité globale (L-Sit)', icon: '🔋' }
];

const STATE_CONFIG: Record<SorenessLevel, { color: string; bg: string; text: string; icon: React.ReactNode }> = {
  'NONE': { color: 'border-brand-border/40', bg: 'bg-brand-text/5', text: 'text-brand-text/50', icon: <CheckCircle2 size={16} className="text-brand-text/40" /> },
  'SORE': { color: 'border-orange-500/50', bg: 'bg-orange-500/10', text: 'text-orange-500', icon: <Activity size={16} className="text-orange-500" /> },
  'PAIN': { color: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-500', icon: <ShieldAlert size={16} className="text-red-500" /> }
};

export default function BodyMap({ state, onChange }: BodyMapProps) {
  
  const handleToggle = (id: MuscleGroup) => {
    const current = state[id];
    const nextLevel: SorenessLevel = current === 'NONE' ? 'SORE' : current === 'SORE' ? 'PAIN' : 'NONE';
    
    // Haptics
    if (nextLevel === 'NONE') haptic.light();
    else if (nextLevel === 'SORE') haptic.medium();
    else haptic.heavy();

    onChange({ ...state, [id]: nextLevel });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {MUSCLES.map((m) => {
        const config = STATE_CONFIG[state[m.id]];
        
        return (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle(m.id)}
            className={`relative p-4 rounded-3xl border text-left flex flex-col transition-colors duration-300 ${config.bg} ${config.color}`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl">{m.icon}</span>
              <div className="bg-brand-bg rounded-full p-1.5 shadow-sm">
                {config.icon}
              </div>
            </div>
            
            <span className={`text-[10px] uppercase font-bold tracking-widest block mb-1 ${config.text}`}>
              {state[m.id] === 'NONE' ? 'Reposé' : state[m.id] === 'SORE' ? 'Courbatures' : 'Douleur / Blessure'}
            </span>
            <span className="font-bold text-brand-text text-sm mb-1">{m.label}</span>
            <span className="text-[10px] text-brand-text/50 font-medium leading-tight">{m.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
