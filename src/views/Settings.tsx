import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import ExportUtility from '../components/ExportUtility';
import { Moon, Sun, ShieldAlert, Database, RefreshCw, Smartphone, User, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [resetConfirm, setResetConfirm] = useState(false);
  const [weight, setWeight] = useState<string>('75');

  useEffect(() => {
    setWeight(db.getUserWeight().toString());
  }, []);

  const handleSaveWeight = () => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      db.saveUserWeight(w);
    }
  };

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleReset = () => {
    if (resetConfirm) {
      localStorage.removeItem('NolanArc_TrainingLogs');
      localStorage.removeItem('NolanArc_Programs');
      window.location.href = '/GUTS/';
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-0 min-h-screen px-4 pb-12">
      <div className="mt-2 mb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Paramètres</h2>
        <p className="text-xs font-medium text-brand-text/50">Préférences, données et maintenance système.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Appearance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <Smartphone size={18} className="text-brand-text" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">Apparence</h3>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-2xl border border-brand-border/40 bg-brand-text/5">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-brand-text">Thème Sombre</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text/40">AMOLED & Nocturne</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 outline-none ${isDark ? 'bg-brand-accent' : 'bg-brand-border'}`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <motion.div 
                layout
                initial={false}
                animate={{ x: isDark ? 26 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center shadow-md absolute top-1"
              >
                {isDark ? <Moon size={12} className="text-brand-accent" /> : <Sun size={12} className="text-brand-border" />}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* Profil Athlète */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-brand-text" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">Profil Athlète</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-xs text-brand-text/60 font-medium leading-relaxed">
              Le poids de corps est utilisé par l'IA pour calculer ton 1RM exact et ajuster tes cycles de force et de volume.
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-brand-text/5 border border-brand-border/40 rounded-xl p-3 text-sm font-bold text-brand-text outline-none focus:border-brand-accent transition-colors"
                  placeholder="75"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-text/40">kg</span>
              </div>
              <button 
                onClick={handleSaveWeight}
                className="bg-brand-accent text-brand-bg px-4 py-3 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <Database size={18} className="text-brand-text" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-text/60">Données & Sauvegarde</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-xs text-brand-text/60 font-medium leading-relaxed">
              Exporte ta matrice complète (logs, examens, tags, combos) au format CSV pour sauvegarde ou analyse externe.
            </p>
            <ExportUtility />
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-bg border border-red-500/20 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5 text-red-500">
            <ShieldAlert size={18} />
            <h3 className="text-[10px] uppercase font-bold tracking-widest">Zone de Danger</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-xs text-red-500/70 font-medium leading-relaxed">
              La réinitialisation supprimera toutes tes performances et programmes stockés localement. Cette action est irréversible.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className={`w-full font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-colors ${
                resetConfirm 
                  ? 'bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)]' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {resetConfirm ? (
                <>Appuie encore pour confirmer</>
              ) : (
                <><RefreshCw size={16} /> Hard Reset</>
              )}
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
