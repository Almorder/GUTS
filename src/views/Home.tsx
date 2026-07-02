import type { TrainingLog } from '../lib/db';
import { db } from '../lib/db';
import { buildSkills } from '../lib/progression';
import HeroStats from '../components/HeroStats';
import SkillCard from '../components/SkillCard';
import Dashboard from '../components/Dashboard';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  logs: TrainingLog[];
  onRefresh?: () => void;
}

export default function Home({ logs, onRefresh }: HomeProps) {
  const skills = buildSkills(logs);
  const examAvailable = skills.some(s => s.isExamAvailable);

  const handleDeleteLog = (id: string) => {
    if (window.confirm("Supprimer ce log définitivement ?")) {
      db.deleteLog(id);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      
      {/* Weekly Goals */}
      <div className="px-5 mb-2">
        <div className="bg-brand-text text-brand-bg rounded-2xl p-4 shadow-lg shadow-brand-text/10">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-brand-accent" />
            <h3 className="font-bold text-sm uppercase tracking-widest">Objectif Semaine</h3>
          </div>
          <p className="text-xs font-medium text-brand-bg/80 leading-relaxed">
            Phase Volume. Viser 30s cumulées de Front Lever par session. Maintenir une Readiness > 6/10.
          </p>
        </div>
      </div>

      {/* Exam Alert */}
      {examAvailable && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-5 mt-2 p-3 border border-brand-accent bg-brand-accent/10 rounded-2xl flex items-center justify-center gap-3 shadow-sm"
        >
          <span className="text-2xl">🎓</span>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">Exam Disponible !</span>
        </motion.div>
      )}

      <HeroStats logs={logs} />

      <div className="px-5 mt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-brand-border/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-text/40 font-bold bg-brand-bg px-2 rounded">Progression</span>
          <div className="flex-1 h-px bg-brand-border/40" />
        </div>

        <div className="flex flex-col gap-4">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-10 mb-5">
          <div className="flex-1 h-px bg-brand-border/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-text/40 font-bold bg-brand-bg px-2 rounded">Activité Récente</span>
          <div className="flex-1 h-px bg-brand-border/40" />
        </div>

        <Dashboard logs={logs} onDelete={handleDeleteLog} />
      </div>
    </div>
  );
}
