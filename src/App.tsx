import { useState, useEffect } from 'react';
import { db } from './lib/db';
import type { TrainingLog } from './lib/db';
import { buildSkills } from './lib/progression';
import Header from './components/Header';
import HeroStats from './components/HeroStats';
import SkillCard from './components/SkillCard';
import Changelog from './components/Changelog';
import Dashboard from './components/Dashboard';
import MainAction from './components/MainAction';
import LogModal from './components/LogModal';
import ExportUtility from './components/ExportUtility';

function App() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshLogs = () => {
    setLogs(db.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const skills = buildSkills(logs);

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 pb-28 relative flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Stats (Level, XP, Streak) */}
      <HeroStats logs={logs} />

      {/* Divider */}
      <div className="flex items-center gap-3 mt-2 mb-4">
        <div className="flex-1 h-px bg-brand-border" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-brand-text/30 font-bold">Progression</span>
        <div className="flex-1 h-px bg-brand-border" />
      </div>

      {/* Skill Cards */}
      <div className="flex flex-col gap-3">
        {skills.map(skill => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {/* Changelog (Collapsible) */}
      <div className="mt-8">
        <Changelog />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mt-8 mb-4">
        <div className="flex-1 h-px bg-brand-border" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-brand-text/30 font-bold">Recent Sets</span>
        <div className="flex-1 h-px bg-brand-border" />
      </div>

      {/* Dashboard */}
      <Dashboard logs={logs} />

      {/* Export */}
      <div className="mt-8 text-center">
        <ExportUtility />
      </div>

      {/* Main CTA */}
      <MainAction onClick={() => setIsModalOpen(true)} />

      {/* Modal */}
      {isModalOpen && (
        <LogModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            refreshLogs();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
