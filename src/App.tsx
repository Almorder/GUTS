import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
      className="pb-24"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const refreshLogs = () => {
    setLogs(db.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-brand-bg text-brand-text overflow-hidden">
      {/* Routes with AnimatePresence */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home logs={logs} /></PageWrapper>} />
            <Route path="/roadmap" element={<PageWrapper><Roadmap /></PageWrapper>} />
            <Route path="/stats" element={<PageWrapper><Stats /></PageWrapper>} />
            <Route path="/planner" element={<PageWrapper><Planner /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Main CTA (Global) */}
      <MainAction onClick={() => setIsModalOpen(true)} />

      {/* Bottom Navigation */}
      <NavBar />

      {/* Modal with AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <LogModal
            onClose={() => setIsModalOpen(false)}
            onSave={() => {
              refreshLogs();
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
