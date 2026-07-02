import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { db } from './lib/db';
import type { TrainingLog } from './lib/db';

import Home from './views/Home';
import Roadmap from './views/Roadmap';
import Stats from './views/Stats';
import Planner from './views/Planner';
import Settings from './views/Settings';

import NavBar from './components/NavBar';
import MainAction from './components/MainAction';
import LogModal from './components/LogModal';

function App() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshLogs = () => {
    setLogs(db.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-brand-bg text-brand-text pb-24">
      {/* Routes */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home logs={logs} />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>

      {/* Main CTA (Global) */}
      <MainAction onClick={() => setIsModalOpen(true)} />

      {/* Bottom Navigation */}
      <NavBar />

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
