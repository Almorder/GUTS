
import type { TrainingLog } from '../lib/db';
import { buildSkills } from '../lib/progression';
import Header from '../components/Header';
import HeroStats from '../components/HeroStats';
import SkillCard from '../components/SkillCard';
import Changelog from '../components/Changelog';
import Dashboard from '../components/Dashboard';

interface HomeProps {
  logs: TrainingLog[];
}

export default function Home({ logs }: HomeProps) {
  const skills = buildSkills(logs);
  const examAvailable = skills.some(s => s.isExamAvailable);

  return (
    <div className="flex flex-col gap-0">
      <Header />
      
      {/* Exam Alert */}
      {examAvailable && (
        <div className="mx-5 mt-4 p-3 border border-brand-accent bg-brand-accent/5 rounded-lg flex items-center justify-center gap-2">
          <span className="text-xl">🎓</span>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">Exam Available !</span>
        </div>
      )}

      <HeroStats logs={logs} />

      <div className="px-5">
        <div className="flex items-center gap-3 mt-2 mb-4">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-brand-text/30 font-bold">Progression</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        <div className="flex flex-col gap-3">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        <div className="mt-8">
          <Changelog />
        </div>

        <div className="flex items-center gap-3 mt-8 mb-4">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-brand-text/30 font-bold">Recent Sets</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        <Dashboard logs={logs} />
      </div>
    </div>
  );
}
