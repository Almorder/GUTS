import type { TrainingProgram, CycleType, SubSet, TrainingLog, Level, BodyState } from './db';
import { getBestPerformance } from './progression';

// Detect user's best level for a movement by checking which levels have logged data
function getBestLevel(logs: TrainingLog[], movement: string, mechanic: string, unit: 's'|'reps'): Level {
  const levels: Level[] = ['Full', 'Straddle', 'Adv Tuck', 'Tuck'];
  for (const level of levels) {
    const best = getBestPerformance(logs, movement, mechanic, unit, level);
    if (best > 0) return level;
  }
  return 'Tuck'; // Default to easiest
}

export function generateProgram(
  availableDays: string[], 
  availableHours: string, 
  targetCycle: CycleType,
  logs: TrainingLog[],
  readinessScore: number,
  bodyState?: BodyState
): Omit<TrainingProgram, 'id' | 'created_at'> {
  
  // Helpers to get PRs (searches across all levels if no level provided)
  const getPR = (mov: string, mech: string, unit: 's'|'reps', level?: string) => 
    Math.max(1, getBestPerformance(logs, mov, mech, unit, level));

  // Ratios
  const isForce = targetCycle === 'Force';
  const isVolume = targetCycle === 'Volume';
  
  // Readiness Scaling (Deload if < 5)
  const isDeload = readinessScore < 5;
  const scale = isDeload ? 0.6 : 1; // 40% reduction in intensity/volume if fatigued
  
  const intensity = (isForce ? 0.85 : isVolume ? 0.70 : 0.50) * scale;
  const restMain = isForce ? 180 : isVolume ? 120 : 90;
  const restSec = isForce ? 150 : isVolume ? 90 : 60;
  
  const setsMain = Math.max(2, Math.floor((isForce ? 5 : isVolume ? 4 : 3) * scale));
  const setsSec = Math.max(2, Math.floor((isForce ? 4 : isVolume ? 4 : 3) * scale));

  // Day 1 Template: Front Lever & Pullups
  const buildDay1 = (): SubSet[] => {
    const flLevel = getBestLevel(logs, 'Front Lever', 'Hold', 's');
    const prFL = getPR('Front Lever', 'Hold', 's', flLevel);
    const prPull = getPR('Tractions', 'Pull', 'reps');
    
    const sets: SubSet[] = [];
    
    // Warmup
    sets.push({ movement: 'Scapular Pulls', mechanic: 'Pull', level: 'Base', reps: 15, targetRest: 60 });
    sets.push({ movement: 'Skin the Cat', mechanic: 'Pull', level: 'Base', reps: 5, targetRest: 60 });
    
    // Main Focus (Front Lever at user's best level)
    for(let i=0; i<setsMain; i++) {
      sets.push({
        movement: 'Front Lever', mechanic: 'Hold', level: flLevel,
        duration: 0, targetDuration: Math.max(2, Math.round(prFL * intensity)),
        targetRest: restMain,
        isAmrap: i === setsMain - 1
      });
    }

    // Secondary Focus (Pullups)
    for(let i=0; i<setsSec; i++) {
      sets.push({
        movement: 'Tractions', mechanic: 'Pull', level: 'Full',
        reps: 0, targetReps: Math.max(3, Math.round(prPull * intensity)),
        targetRest: restSec,
        isAmrap: i === setsSec - 1
      });
    }

    // Accessories SuperSet (Core)
    for(let i=0; i<3; i++) {
      sets.push({ movement: 'L-sit', mechanic: 'Hold', level: 'Tuck', duration: 0, targetDuration: 15, isSuperSet: true });
      sets.push({ movement: 'Renforcement Core', mechanic: 'Hold', level: 'Tuck', duration: 0, targetDuration: 30, targetRest: 90 });
    }

    return sets;
  };

  // Day 2 Template: Planche & Dips
  const buildDay2 = (): SubSet[] => {
    const plLevel = getBestLevel(logs, 'Planche', 'Hold', 's');
    const prPlanche = getPR('Planche', 'Hold', 's', plLevel);
    const prDips = getPR('Dips', 'Push', 'reps');
    
    const sets: SubSet[] = [];
    
    sets.push({ movement: 'Planche Lean', mechanic: 'Hold', level: 'Base', duration: 0, targetDuration: 20, targetRest: 60 });
    
    for(let i=0; i<setsMain; i++) {
      sets.push({
        movement: 'Planche', mechanic: 'Hold', level: plLevel,
        duration: 0, targetDuration: Math.max(2, Math.round(prPlanche * intensity)),
        targetRest: restMain,
        isAmrap: i === setsMain - 1
      });
    }

    for(let i=0; i<setsSec; i++) {
      sets.push({
        movement: 'Dips', mechanic: 'Push', level: 'Full',
        reps: 0, targetReps: Math.max(5, Math.round(prDips * intensity)),
        targetRest: restSec,
        isAmrap: i === setsSec - 1
      });
    }

    for(let i=0; i<3; i++) {
      sets.push({ movement: 'Handstand', mechanic: 'Hold', level: 'Tuck', duration: 0, targetDuration: 15, targetRest: 90 });
    }

    return sets;
  };

  // Day 3 Template: Handstand & Mix
  const buildDay3 = (): SubSet[] => {
    const hsLevel = getBestLevel(logs, 'Handstand', 'Hold', 's');
    const prHS = getPR('Handstand', 'Hold', 's', hsLevel);
    
    const sets: SubSet[] = [];
    
    for(let i=0; i<setsMain; i++) {
      sets.push({
        movement: 'Handstand', mechanic: 'Hold', level: hsLevel,
        duration: 0, targetDuration: Math.max(5, Math.round(prHS * intensity)),
        targetRest: restMain,
        isAmrap: i === setsMain - 1
      });
    }

    for(let i=0; i<setsSec; i++) {
      sets.push({ movement: 'Tractions', mechanic: 'Pull', level: 'Full', reps: 0, targetReps: 8, isSuperSet: true, isAmrap: i === setsSec - 1 });
      sets.push({ movement: 'Dips', mechanic: 'Push', level: 'Full', reps: 0, targetReps: 10, targetRest: 120, isAmrap: i === setsSec - 1 });
    }

    return sets;
  };

  const buildRecoveryDay = (): SubSet[] => {
    return [
      { movement: 'Renforcement', mechanic: 'Hold', level: 'Full', duration: 300, targetDuration: 300 },
      { movement: 'L-sit', mechanic: 'Hold', level: 'Tuck', duration: 0, targetDuration: 30, targetRest: 60 },
      { movement: 'Renforcement Core', mechanic: 'Hold', level: 'Full', duration: 0, targetDuration: 60, targetRest: 60 }
    ];
  };

  const allTemplates = [
    { id: 'day1', focus: ['Front Lever', 'Pullups'], builder: buildDay1 },
    { id: 'day2', focus: ['Planche', 'Dips'], builder: buildDay2 },
    { id: 'day3', focus: ['Handstand', 'Mix'], builder: buildDay3 }
  ];

  let activeTemplates = [...allTemplates];

  if (bodyState) {
    // PAIN Filters
    if (bodyState.lats === 'PAIN' || bodyState.core === 'PAIN') {
      activeTemplates = activeTemplates.filter(t => t.id !== 'day1');
    }
    if (bodyState.chest === 'PAIN' || bodyState.shoulders === 'PAIN' || bodyState.core === 'PAIN') {
      activeTemplates = activeTemplates.filter(t => t.id !== 'day2');
    }
    if (bodyState.shoulders === 'PAIN') {
      activeTemplates = activeTemplates.filter(t => t.id !== 'day3');
    }
  }

  // Fallback to recovery if everything is blocked
  if (activeTemplates.length === 0) {
    activeTemplates = [{ id: 'recovery', focus: ['Mobilité', 'Récupération'], builder: buildRecoveryDay }];
  }

  const schedule = availableDays.map((day, index) => {
    const t = activeTemplates[index % activeTemplates.length];
    
    // SORE scaling (reduce intensity for the specific template if the muscle is SORE)
    let sessionScale = 1;
    if (bodyState) {
      if (t.id === 'day1' && (bodyState.lats === 'SORE' || bodyState.core === 'SORE')) sessionScale = 0.7;
      if (t.id === 'day2' && (bodyState.chest === 'SORE' || bodyState.shoulders === 'SORE' || bodyState.core === 'SORE')) sessionScale = 0.7;
      if (t.id === 'day3' && bodyState.shoulders === 'SORE') sessionScale = 0.7;
    }

    const baseSets = t.builder();
    const structured_focus = baseSets.map(set => {
      const s = { ...set };
      if (s.targetDuration && sessionScale < 1) s.targetDuration = Math.max(5, Math.floor(s.targetDuration * sessionScale));
      if (s.targetReps && sessionScale < 1) s.targetReps = Math.max(1, Math.floor(s.targetReps * sessionScale));
      return s;
    });

    return {
      day,
      hour: availableHours,
      focus: t.focus,
      structured_focus
    };
  });

  return {
    week_start: new Date().toISOString(),
    schedule
  };
}
