import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/db';
import type { TrainingLog, Movement, Level, Mechanic } from '../lib/db';
import { buildSkills } from '../lib/progression';
import type { Skill } from '../lib/progression';
import { AnimatePresence } from 'framer-motion';
import SkillNode from '../components/SkillNode';
import SkillDetailModal from '../components/SkillDetailModal';

interface RoadmapProps {
  openLogger?: (config: { isExam: boolean, movement: Movement, level: Level, mechanic: Mechanic, targetUnit: 's'|'reps', targetValue: number }) => void;
}

export default function Roadmap({ openLogger }: RoadmapProps) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setLogs(db.getLogs());
  }, []);

  const skills = useMemo(() => buildSkills(logs), [logs]);

  // Helper to find skill state
  const getSkill = (id: string) => skills.find(s => s.id === id);
  
  // Connection line component
  const Connection = ({ from, to, startX, startY, endX, endY }: { from: string, to: string, startX: string, startY: string, endX: string, endY: string }) => {
    const sourceSkill = getSkill(from);
    const targetSkill = getSkill(to);
    if (!sourceSkill || !targetSkill) return null;

    // Line is "active" if the source skill has at least 1 unlocked milestone
    const isActive = sourceSkill.milestones[0]?.unlocked;
    // Line is "completed" if the target skill also has at least 1 unlocked milestone
    const isCompleted = isActive && targetSkill.milestones[0]?.unlocked;

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id={`grad-${from}-${to}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isActive ? 'var(--color-brand-accent)' : 'currentColor'} stopOpacity={isActive ? 1 : 0.1} />
            <stop offset="100%" stopColor={isCompleted ? 'var(--color-brand-accent)' : 'currentColor'} stopOpacity={isCompleted ? 1 : 0.1} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <line
          x1={startX} y1={startY}
          x2={endX} y2={endY}
          stroke={`url(#grad-${from}-${to})`}
          strokeWidth="3"
          strokeLinecap="round"
          className={isActive ? 'text-brand-accent' : 'text-brand-border'}
          filter={isActive ? 'url(#glow)' : ''}
        />
        {/* Animated pulse if active but target not completed */}
        {isActive && !isCompleted && (
          <circle r="4" fill="var(--color-brand-accent)" filter="url(#glow)">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={`M ${startX.replace('%','')} ${startY.replace('%','')} L ${endX.replace('%','')} ${endY.replace('%','')}`}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-6 min-h-screen">
      <div className="px-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Skill Tree</h1>
        <p className="text-sm text-brand-text/60">L'arbre de maîtrise de la gravité.</p>
      </div>
      
      <div className="px-5 flex-1 flex flex-col relative mt-8">
        
        {/* Visual Map Container */}
        <div className="relative w-full h-[500px] bg-brand-bg/50 border border-brand-border/30 rounded-3xl overflow-hidden shadow-inner">
          
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          {/* Connections */}
          {/* Pullups -> Front Lever */}
          <Connection from="pullups" to="fl-hold" startX="20%" startY="25%" endX="20%" endY="75%" />
          {/* Pullups -> Muscle Up */}
          <Connection from="pullups" to="muscleup" startX="20%" startY="25%" endX="50%" endY="75%" />
          {/* Dips -> Muscle Up */}
          <Connection from="dips" to="muscleup" startX="50%" startY="25%" endX="50%" endY="75%" />
          {/* Dips -> Planche */}
          <Connection from="dips" to="planche" startX="50%" startY="25%" endX="80%" endY="75%" />
          {/* Handstand -> Planche */}
          <Connection from="hs" to="planche" startX="80%" startY="25%" endX="80%" endY="75%" />

          {/* Nodes */}
          {/* Tier 1 */}
          <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('pullups') && <SkillNode skill={getSkill('pullups')!} onClick={() => setSelectedSkill(getSkill('pullups')!)} />}
          </div>
          <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('dips') && <SkillNode skill={getSkill('dips')!} onClick={() => setSelectedSkill(getSkill('dips')!)} />}
          </div>
          <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('hs') && <SkillNode skill={getSkill('hs')!} onClick={() => setSelectedSkill(getSkill('hs')!)} />}
          </div>

          {/* Tier 2 */}
          <div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('fl-hold') && <SkillNode skill={getSkill('fl-hold')!} onClick={() => setSelectedSkill(getSkill('fl-hold')!)} />}
          </div>
          <div className="absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('muscleup') && <SkillNode skill={getSkill('muscleup')!} onClick={() => setSelectedSkill(getSkill('muscleup')!)} />}
          </div>
          <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10">
            {getSkill('planche') && <SkillNode skill={getSkill('planche')!} onClick={() => setSelectedSkill(getSkill('planche')!)} />}
          </div>
          
        </div>
        
        <p className="text-center text-[10px] uppercase tracking-widest text-brand-text/40 font-bold mt-6">
          Débloque les prérequis pour accéder aux compétences supérieures
        </p>
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            logs={logs}
            onClose={() => setSelectedSkill(null)}
            openLogger={openLogger}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
