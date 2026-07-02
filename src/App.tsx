import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { db } from './lib/db';
import type { TrainingLog, Movement, Level, Mechanic } from './lib/db';

import Home from './views/Home';
import Roadmap from './views/Roadmap';
import Stats from './views/Stats';
import Planner from './views/Planner';
import Settings from './views/Settings';

import NavBar from './components/NavBar';
import MainAction from './components/MainAction';
import LogModal from './components/LogModal';

export interface LogModalConfig {
  isOpen: boolean;
  isExam?: boolean;
  movement?: Movement;
  level?: Level;
  mechanic?: Mechanic;
  targetUnit?: 's' | 'reps';
  targetValue?: number;
  initialLog?: import('./lib/db').TrainingLog;
}

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="pt-36 pb-24 px-4"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [modalConfig, setModalConfig] = useState<LogModalConfig>({ isOpen: false });
  const location = useLocation();

  const refreshLogs = () => {
    setLogs(db.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-brand-bg text-brand-text overflow-hidden">
      {/* Top Navigation */}
      <NavBar />

      {/* Routes with AnimatePresence */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home logs={logs} onRefresh={refreshLogs} onEditLog={(log) => setModalConfig({ isOpen: true, initialLog: log })} /></PageWrapper>} />
            <Route path="/roadmap" element={<PageWrapper><Roadmap openLogger={(c) => setModalConfig({ ...c, isOpen: true })} /></PageWrapper>} />
            <Route path="/stats" element={<PageWrapper><Stats onEditLog={(log) => setModalConfig({ isOpen: true, initialLog: log })} /></PageWrapper>} />
            <Route path="/planner" element={<PageWrapper><Planner /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Main CTA (Global) */}
      <MainAction onClick={() => setModalConfig({ isOpen: true })} />

      {/* Modal with AnimatePresence */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <LogModal
            config={modalConfig}
            onClose={() => setModalConfig({ isOpen: false })}
            onSave={() => {
              refreshLogs();
              setModalConfig({ isOpen: false });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
