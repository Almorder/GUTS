import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { TrainingProgram, CycleType } from '../lib/db';
import { generateProgram } from '../lib/scheduler';
import { Calendar as CalIcon, Clock, Sparkles, Check, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const CYCLES: CycleType[] = ['Force', 'Volume', 'Décharge'];

export default function Planner() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hour, setHour] = useState('18:00');
  const [cycle, setCycle] = useState<CycleType>('Force');
  
  const [draft, setDraft] = useState<Omit<TrainingProgram, 'id' | 'created_at'> | null>(null);

  useEffect(() => {
    setPrograms(db.getPrograms().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleGenerate = () => {
    if (selectedDays.length === 0) return;
    const logs = db.getLogs();
    const newProg = generateProgram(selectedDays, hour, logs, cycle);
    setDraft(newProg); // Show draft for editing before saving
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    const saved = db.addProgram(draft);
    setPrograms([saved, ...programs]);
    setDraft(null);
    setSelectedDays([]);
  };

  const handleEditDraftFocus = (index: number, newFocusStr: string) => {
    if (!draft) return;
    const updated = { ...draft };
    updated.schedule[index].focus = newFocusStr.split(',').map(s => s.trim());
    setDraft(updated);
  };

  const handleDeleteProgram = (id: string) => {
    if (window.confirm("Supprimer ce programme ?")) {
      const updated = programs.filter(p => p.id !== id);
      setPrograms(updated);
      localStorage.setItem('NolanArc_Programs', JSON.stringify(updated));
    }
  };

  return (
    <div className="flex flex-col gap-0 min-h-screen px-4 pb-12">
      <div className="mt-2 mb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Planner</h2>
        <p className="text-xs font-medium text-brand-text/50">Génère ton programme selon ton cycle actuel.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Generator Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="mb-5">
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Cycle d'Entraînement</label>
            <div className="flex bg-brand-text/5 p-1.5 rounded-2xl">
              {CYCLES.map(c => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`relative flex-1 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors ${
                    cycle === c ? 'text-brand-text' : 'text-brand-text/50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {cycle === c && (
                    <motion.div
                      layoutId="planner-cycle-bg"
                      className="absolute inset-0 bg-brand-bg rounded-xl shadow-sm border border-brand-border/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Jours Disponibles</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedDays.includes(day) 
                      ? 'bg-brand-text text-brand-bg border-brand-text shadow-md shadow-brand-text/10' 
                      : 'border-brand-border/50 bg-brand-text/5 text-brand-text/60'
                  }`}
                >
                  {day.substring(0, 3)}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[10px] uppercase font-bold text-brand-text/50 tracking-widest block mb-3">Heure par défaut</label>
            <input
              type="time"
              value={hour}
              onChange={e => setHour(e.target.value)}
              className="bg-brand-text/5 border border-brand-border/30 rounded-xl p-3 text-sm font-bold text-brand-text outline-none w-full"
            />
          </div>

          <motion.button
            whileHover={{ scale: selectedDays.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedDays.length > 0 ? 0.98 : 1 }}
            onClick={handleGenerate}
            disabled={selectedDays.length === 0}
            className="w-full bg-brand-accent text-[#F0EBE2] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(204,70,12,0.3)] transition-all"
          >
            <Sparkles size={18} />
            Générer
          </motion.button>
        </motion.div>

        {/* Draft Editor */}
        <AnimatePresence>
          {draft && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="bg-brand-accent/5 border border-brand-accent/30 rounded-3xl p-5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-bold text-brand-accent">Aperçu du Programme</h3>
                <span className="text-[9px] uppercase tracking-widest font-bold bg-brand-accent text-brand-bg px-2 py-1 rounded-md">{cycle}</span>
              </div>
              
              <div className="flex flex-col gap-3 mb-6">
                {draft.schedule.map((session, i) => (
                  <div key={i} className="bg-brand-bg border border-brand-accent/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{session.day}</span>
                      <span className="text-[10px] uppercase font-bold text-brand-text/50 flex items-center gap-1"><Clock size={12} /> {session.hour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit2 size={12} className="text-brand-accent/50" />
                      <input 
                        type="text" 
                        value={session.focus.join(', ')} 
                        onChange={(e) => handleEditDraftFocus(i, e.target.value)}
                        className="bg-transparent text-xs font-bold text-brand-text outline-none w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setDraft(null)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-brand-text/60 bg-brand-border/20 rounded-xl">Annuler</button>
                <button onClick={handleSaveDraft} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-brand-accent text-[#F0EBE2] rounded-xl flex justify-center items-center gap-2 shadow-md">
                  <Check size={16} /> Valider
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History of Programs */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-brand-border/40" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-text/40 font-bold bg-brand-bg px-2 rounded">Archives</span>
            <div className="flex-1 h-px bg-brand-border/40" />
          </div>
          
          {programs.length === 0 ? (
            <p className="text-sm text-brand-text/40 text-center py-6">Aucun programme généré pour le moment.</p>
          ) : (
            <AnimatePresence>
              {programs.map((prog, index) => (
                <motion.div 
                  key={prog.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative bg-brand-bg border border-brand-border/50 rounded-3xl p-5 shadow-sm group"
                >
                  {index === 0 && (
                    <div className="absolute -top-3 right-5 bg-brand-text text-brand-bg text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
                      Actuel
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteProgram(prog.id)}
                    className="absolute top-4 right-4 text-brand-text/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-2 mb-4">
                    <CalIcon size={16} className="text-brand-accent" />
                    <span className="text-sm font-bold">Semaine du {format(new Date(prog.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {prog.schedule.map((session, i) => (
                      <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${index === 0 ? 'border-brand-text/20 bg-brand-text/5' : 'border-brand-border/30 bg-brand-text/5'}`}>
                        <div>
                          <span className="font-bold text-sm block text-brand-text">{session.day}</span>
                          <div className="flex items-center gap-1 text-[10px] text-brand-text/50 mt-1 uppercase tracking-widest font-medium">
                            <Clock size={10} /> {session.hour}
                          </div>
                        </div>
                        <div className="text-right flex flex-col gap-1">
                          {session.focus.map((f, j) => (
                            <span key={j} className="block text-xs font-bold text-brand-text bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border/30">{f}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
