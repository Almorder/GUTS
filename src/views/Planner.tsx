import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { TrainingProgram } from '../lib/db';
import { generateProgram } from '../lib/scheduler';
import Header from '../components/Header';
import { Calendar as CalIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function Planner() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hour, setHour] = useState('18:00');

  useEffect(() => {
    setPrograms(db.getPrograms().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleGenerate = () => {
    if (selectedDays.length === 0) return;
    const logs = db.getLogs();
    const newProg = generateProgram(selectedDays, hour, logs);
    const saved = db.addProgram(newProg);
    setPrograms([saved, ...programs]);
    setSelectedDays([]); // reset form
  };

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      <Header />
      
      <div className="px-5 mt-4">
        <h2 className="font-serif text-xl font-bold mb-1">Générateur de Semaine</h2>
        <p className="text-xs text-brand-text/50 mb-6">L'algorithme s'adapte à ta fatigue et tes objectifs.</p>
        
        {/* Generator Form */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-4 mb-8">
          <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-3">Disponibilités</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  selectedDays.includes(day) ? 'bg-brand-text text-brand-bg border-brand-text' : 'border-brand-border text-brand-text/50'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          <label className="text-[10px] uppercase font-bold text-brand-text/40 tracking-widest block mb-2">Heure Préférée</label>
          <input
            type="time"
            value={hour}
            onChange={e => setHour(e.target.value)}
            className="bg-brand-bg border border-brand-border rounded-lg p-2 text-sm outline-none w-full mb-4"
          />

          <button
            onClick={handleGenerate}
            disabled={selectedDays.length === 0}
            className="w-full bg-brand-accent text-brand-bg font-bold py-3 rounded-lg uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            Générer le programme
          </button>
        </div>

        {/* History of Programs */}
        <div className="flex flex-col gap-6 pb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text border-b border-brand-border pb-2">Archives des Programmes</h3>
          
          {programs.length === 0 ? (
            <p className="text-xs text-brand-text/40 italic">Aucun programme généré pour le moment.</p>
          ) : (
            programs.map((prog, index) => (
              <div key={prog.id} className="relative">
                {index === 0 && (
                  <div className="absolute -top-3 right-0 bg-brand-accent text-brand-bg text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                    Actuel
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <CalIcon size={14} className="text-brand-text/40" />
                  <span className="text-xs font-bold">Semaine du {format(new Date(prog.created_at), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {prog.schedule.map((session, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? 'border-brand-accent/30 bg-brand-accent/5' : 'border-brand-border bg-brand-bg/50'}`}>
                      <div>
                        <span className="font-bold text-sm block">{session.day}</span>
                        <div className="flex items-center gap-1 text-[10px] text-brand-text/50 mt-1 uppercase tracking-widest">
                          <Clock size={10} /> {session.hour}
                        </div>
                      </div>
                      <div className="text-right">
                        {session.focus.map((f, j) => (
                          <span key={j} className="block text-xs font-bold text-brand-text">{f}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
