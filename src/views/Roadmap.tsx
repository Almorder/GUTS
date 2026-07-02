import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { TrainingLog } from '../lib/db';
import { buildSkills } from '../lib/progression';
import Header from '../components/Header';
import { Lock, Unlock, CheckCircle } from 'lucide-react';

export default function Roadmap() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  const skills = buildSkills(logs);

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      <Header />
      
      <div className="px-5 mt-4">
        <h2 className="font-serif text-xl font-bold mb-1">Roadmap (2026-2028)</h2>
        <p className="text-xs text-brand-text/50 mb-6">La voie de la maîtrise. Passe les examens pour débloquer les paliers suivants.</p>
        
        <div className="flex flex-col gap-8 pb-10">
          {skills.map(skill => (
            <div key={skill.id} className="relative">
              {/* Skill Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">{skill.name}</h3>
                  <p className="text-[10px] text-brand-text/40 tracking-widest">{skill.subtitle}</p>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div className="ml-4 pl-4 border-l-2 border-brand-border/40 flex flex-col gap-6 relative">
                {skill.milestones.map((m, i) => {
                  const isPassed = m.unlocked;
                  // For UI: if the previous is passed, this one is "Current Goal"
                  const isCurrentTarget = !m.unlocked && (i === 0 || skill.milestones[i - 1].unlocked);

                  return (
                    <div key={i} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${
                        isPassed ? 'bg-brand-accent border-brand-accent' :
                        isCurrentTarget ? 'bg-brand-bg border-brand-accent' :
                        'bg-brand-bg border-brand-border'
                      }`} />

                      {/* Content Card */}
                      <div className={`p-3 rounded-lg border transition-all duration-300 ${
                        isPassed ? 'border-brand-accent/30 bg-brand-accent/5' :
                        isCurrentTarget ? 'border-brand-text/30 bg-brand-bg shadow-sm' :
                        'border-brand-border/40 bg-brand-bg/50 opacity-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPassed ? <CheckCircle size={14} className="text-brand-accent" /> :
                             isCurrentTarget ? <Unlock size={14} className="text-brand-text" /> :
                             <Lock size={14} className="text-brand-text/40" />}
                            <span className="font-bold text-sm">{m.label}</span>
                          </div>
                          <span className={`font-bold tabular-nums ${isPassed ? 'text-brand-accent' : 'text-brand-text'}`}>
                            {m.target}<span className="text-[10px] font-normal ml-0.5">{m.unit}</span>
                          </span>
                        </div>
                        {isCurrentTarget && skill.isExamAvailable && (
                          <div className="mt-2 text-[10px] uppercase font-bold text-brand-bg bg-brand-accent rounded px-2 py-1 inline-block">
                            🎓 Examen Débloqué ! Logue-le dans le QG.
                          </div>
                        )}
                        {isCurrentTarget && !skill.isExamAvailable && (
                          <div className="mt-2 w-full h-1 bg-brand-border/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-text rounded-full transition-all duration-700"
                              style={{ width: `${Math.min((skill.current / m.target) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
