import { useState } from 'react';
import { db } from '../lib/db';
import { motion } from 'framer-motion';
import { ChevronRight, Target } from 'lucide-react';
import { haptic } from '../lib/haptics';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [pulls, setPulls] = useState(0);
  const [dips, setDips] = useState(0);
  const [fl, setFl] = useState(0);
  const [pl, setPl] = useState(0);

  const handleStart = () => {
    // Create baseline exam
    db.addLog({
      cycle_type: 'Force',
      is_exam: true,
      energy_level: 10,
      tags: ['🚀 Initial Baseline'],
      sets: [
        { movement: 'Tractions', mechanic: 'Pull', level: 'Full', reps: pulls, duration: 0, weight: 0 },
        { movement: 'Dips', mechanic: 'Pull', level: 'Full', reps: dips, duration: 0, weight: 0 },
        { movement: 'Front Lever', mechanic: 'Hold', level: 'Tuck', reps: 0, duration: fl, weight: 0 },
        { movement: 'Planche', mechanic: 'Hold', level: 'Tuck', reps: 0, duration: pl, weight: 0 }
      ]
    });
    haptic.success();
    onComplete();
  };

  return (
    <div className="flex flex-col min-h-screen px-5 pb-12 pt-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">Bienvenue</h1>
        <p className="text-brand-text/60 text-sm leading-relaxed mb-10">
          Pour que le Coach IA puisse générer ton premier programme, nous devons évaluer ton niveau actuel. Indique tes records (même si c'est zéro).
        </p>

        <div className="space-y-6">
          <MetricAdjuster label="Max Tractions" value={pulls} onChange={setPulls} format={(v) => `${v}r`} step={1} />
          <MetricAdjuster label="Max Dips" value={dips} onChange={setDips} format={(v) => `${v}r`} step={1} />
          <MetricAdjuster label="Front Lever (Tuck)" value={fl} onChange={setFl} format={(v) => `${v}s`} step={5} />
          <MetricAdjuster label="Planche (Tuck)" value={pl} onChange={setPl} format={(v) => `${v}s`} step={5} />
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="w-full mt-10 font-bold py-4 rounded-2xl uppercase tracking-widest text-sm transition-all duration-300 bg-brand-accent text-brand-bg shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
      >
        Démarrer l'Entraînement <ChevronRight size={18} />
      </motion.button>
    </div>
  );
}

function MetricAdjuster({ label, value, onChange, format, step }: { label: string, value: number, onChange: (v: number) => void, format: (v: number) => string, step: number }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg border border-brand-border/40 shadow-sm">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-brand-text/40" />
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-10 h-10 rounded-full bg-brand-text/5 flex items-center justify-center font-bold text-xl">-</button>
        <span className="w-10 text-center font-bold tabular-nums text-lg text-brand-accent">{format(value)}</span>
        <button onClick={() => onChange(value + step)} className="w-10 h-10 rounded-full bg-brand-text/5 flex items-center justify-center font-bold text-xl">+</button>
      </div>
    </div>
  );
}
