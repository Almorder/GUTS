import { useState } from 'react';
import type { TrainingLog } from '../lib/db';
import { db } from '../lib/db';
import { buildSkills, getReadinessScore, getReadinessText } from '../lib/progression';
import HeroStats from '../components/HeroStats';
import SkillCard from '../components/SkillCard';
import Dashboard from '../components/Dashboard';
import { Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SkillDetailModal from '../components/SkillDetailModal';
import ExamModal from '../components/ExamModal';

interface HomeProps {
  logs: TrainingLog[];
  onRefresh?: () => void;
  onEditLog?: (log: TrainingLog) => void;
}

export default function Home({ logs, onRefresh, onEditLog }: HomeProps) {
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const skills = buildSkills(logs);
  const examAvailable = skills.some(s => s.isExamAvailable);
  const readiness = getReadinessScore(logs);

  return (
    <div className="flex flex-col gap-2">
      
      {/* Weekly Goals */}
      <div className="px-5 mb-2">
        <div className="bg-brand-text text-brand-bg rounded-2xl p-4 shadow-lg shadow-brand-text/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-brand-accent" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Readiness Score</h3>
            </div>
            <span className={`font-bold text-lg tabular-nums ${readiness >= 8 ? 'text-green-500' : readiness >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
              {readiness}/10
            </span>
          </div>
          <p className="text-xs font-medium text-brand-bg/80 leading-relaxed">
            {getReadinessText(readiness)}
          </p>
        </div>
      </div>

      {/* Exam Alert */}
      {examAvailable && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExamModalOpen(true)}
          className="mx-5 mt-2 p-3 border border-brand-accent bg-brand-accent/10 rounded-2xl flex items-center justify-center gap-3 shadow-sm cursor-pointer"
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
            <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-10 mb-5">
          <div className="flex-1 h-px bg-brand-border/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-text/40 font-bold bg-brand-bg px-2 rounded">Activité Récente</span>
          <div className="flex-1 h-px bg-brand-border/40" />
        </div>
        
        <Dashboard 
          logs={logs} 
          onDelete={(id) => {
            db.deleteLog(id);
            if (onRefresh) onRefresh();
          }}
          onEdit={onEditLog}
        />
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            logs={logs}
            onClose={() => setSelectedSkill(null)}
            onEditLog={onEditLog}
          />
        )}
        {isExamModalOpen && (
          <ExamModal
            skills={skills.filter(s => s.isExamAvailable)}
            onClose={() => setIsExamModalOpen(false)}
            onSave={() => {
              setIsExamModalOpen(false);
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
