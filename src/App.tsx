import { useState, useEffect } from 'react';
import { db } from './lib/db';
import type { TrainingLog } from './lib/db';
import Header from './components/Header';
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

  return (
    <div className="max-w-md mx-auto min-h-screen px-4 py-8 pb-32 relative flex flex-col">
      <Header />
      <div className="mt-10 flex-1">
        <Dashboard logs={logs} />
      </div>
      <MainAction onClick={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <LogModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            refreshLogs();
            setIsModalOpen(false);
          }} 
        />
      )}
      <div className="mt-16 text-center">
        <ExportUtility />
      </div>
    </div>
  );
}

export default App;
