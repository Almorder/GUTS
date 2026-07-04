import type { TrainingLog } from './db';

// ─────────────────────────────────────────────────────────────
// Milestones & Skills
// ─────────────────────────────────────────────────────────────

export interface Milestone {
  label: string;
  target: number;
  unit: 's' | 'reps';
  level: string; // V11: Variation Level (e.g. Tuck, Straddle)
  unlocked: boolean;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  current: number; // Based on highest unlocked milestone target
  milestones: Milestone[];
  movement: string;
  mechanic: string;
  isExamAvailable: boolean;
  prerequisites: string[];
  isLocked: boolean;
}

function parseLegacyPerformance(perf: string): number {
  if (!perf) return 0;
  const secMatch = perf.match(/(\d+\.?\d*)\s*s/i);
  if (secMatch) return parseFloat(secMatch[1]);
  const repMatch = perf.match(/(\d+\.?\d*)\s*r/i);
  if (repMatch) return parseFloat(repMatch[1]);
  const numMatch = perf.match(/^(\d+\.?\d*)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return 0;
}

export function getBestPerformance(
  logs: TrainingLog[],
  movement: string,
  mechanic: string,
  unit: 's' | 'reps',
  level?: string,
): number {
  let best = 0;

  for (const log of logs) {
    // V3 Support: check in sets array
    if (log.sets && log.sets.length > 0) {
      for (const set of log.sets) {
        if (set.movement === movement && set.mechanic === mechanic && (!level || set.level === level)) {
          const val = unit === 's' ? (set.duration || 0) : (set.reps || 0);
          if (val > best) best = val;
        }
      }
    } 
    // V2 Legacy fallback
    else if (log.movement === movement && log.mechanic === mechanic && (!level || log.level === level)) {
      const val = parseLegacyPerformance(log.top_set_performance || '');
      if (val > best) best = val;
    }
  }

  return best;
}

export function getSkillProgress(skill: Skill): number {
  if (skill.milestones.length === 0) return 0;
  // Progress is relative to the currently active milestone
  const next = getNextMilestone(skill);
  if (!next) return 100; // maxed out
  
  // Find previous tier target to calculate relative progress
  let prevTarget = 0;
  for (const m of skill.milestones) {
    if (m === next) break;
    prevTarget = m.target;
  }
  
  const currentLevelProgress = skill.current - prevTarget;
  const targetDiff = next.target - prevTarget;
  
  if (currentLevelProgress <= 0) return 0;
  return Math.min((currentLevelProgress / targetDiff) * 100, 100);
}

export function getNextMilestone(skill: Skill): Milestone | null {
  for (const m of skill.milestones) {
    if (!m.unlocked) return m;
  }
  return null;
}

export function getCurrentTier(skill: Skill): number {
  let tier = 0;
  for (const m of skill.milestones) {
    if (m.unlocked) tier++;
  }
  return tier;
}

// ─────────────────────────────────────────────────────────────
// Build skills with Exam Logic
// ─────────────────────────────────────────────────────────────
export function buildSkills(logs: TrainingLog[]): Skill[] {
  // Helper to determine if a milestone is unlocked (meaning an exam was passed for it)
  // Since we are migrating to V3, we will simulate unlocked state based on current max,
  // but future unlocks require explicit is_exam logs.
  
  const hasPassedExam = (movement: string, level: string, target: number, unit: 's'|'reps') => {
    return logs.some(l => {
      if (!l.is_exam) return false;
      if (l.sets) {
        return l.sets.some(s => {
          if (s.movement !== movement || s.level !== level) return false;
          const val = unit === 's' ? (s.duration || 0) : (s.reps || 0);
          return val >= target;
        });
      }
      return false;
    });
  };

  const createSkill = (
    id: string, name: string, icon: string, subtitle: string, 
    movement: string, mechanic: string, unit: 's'|'reps',
    milestonesDef: {label: string, target: number, level: string}[],
    prerequisites: string[] = []
  ): Skill => {
    
    const milestones: Milestone[] = milestonesDef.map((m) => {
      const bestForLevel = getBestPerformance(logs, movement, mechanic, unit, m.level);
      const examPassed = hasPassedExam(movement, m.level, m.target, unit);
      const isUnlocked = examPassed || (bestForLevel >= m.target); 
      return { ...m, unit, unlocked: isUnlocked };
    });

    // Current is derived from highest unlocked milestone (progress calculation logic uses it)
    let current = 0;
    const next = milestones.find(m => !m.unlocked);
    if (next) {
      // If we have a next milestone, current is bestForLevel of the next milestone
      // Plus the baseline of previous unlocked milestones if needed, but for simplicity
      // we just track the current performance on the specific level being worked on.
      current = getBestPerformance(logs, movement, mechanic, unit, next.level);
    } else {
      const last = milestones[milestones.length - 1];
      current = getBestPerformance(logs, movement, mechanic, unit, last.level);
    }

    const isExamAvailable = next ? current >= next.target : false;

    return {
      id, name, icon, subtitle, current, milestones, movement, mechanic, isExamAvailable, prerequisites, isLocked: false
    };
  };

  const skills = [
    createSkill('pullups', 'Tractions', '💪', 'Pull-ups', 'Tractions', 'Pull', 'reps', [
      { label: 'Base', target: 10, level: 'Full' },
      { label: 'Strong', target: 15, level: 'Full' },
      { label: 'Elite', target: 20, level: 'Full' },
      { label: 'Master', target: 25, level: 'Full' },
    ]),
    createSkill('dips', 'Dips', '🔱', 'Parallel Bars', 'Dips', 'Push', 'reps', [
      { label: 'Base', target: 15, level: 'Full' },
      { label: 'Strong', target: 25, level: 'Full' },
      { label: 'Elite', target: 35, level: 'Full' },
      { label: 'Master', target: 45, level: 'Full' },
    ]),
    createSkill('hs', 'Handstand', '🤸', 'Hold', 'Handstand', 'Hold', 's', [
      { label: 'Wall', target: 60, level: 'Tuck' }, 
      { label: 'Free Base', target: 15, level: 'Full' },
      { label: 'Free Solid', target: 30, level: 'Full' },
      { label: 'Master', target: 60, level: 'Full' },
    ]),
    createSkill('fl-hold', 'Front Lever', '🔒', 'Hold Variations', 'Front Lever', 'Hold', 's', [
      { label: 'Tuck', target: 15, level: 'Tuck' },
      { label: 'Adv Tuck', target: 15, level: 'Adv Tuck' },
      { label: 'Straddle', target: 10, level: 'Straddle' },
      { label: 'Full', target: 8, level: 'Full' },
    ], ['pullups']),
    createSkill('planche', 'Planche', '🔥', 'Hold Variations', 'Planche', 'Hold', 's', [
      { label: 'Tuck', target: 15, level: 'Tuck' },
      { label: 'Adv Tuck', target: 10, level: 'Adv Tuck' },
      { label: 'Straddle', target: 8, level: 'Straddle' },
      { label: 'Full', target: 5, level: 'Full' },
    ], ['dips', 'hs']),
    createSkill('muscleup', 'Muscle Up', '💥', 'Pull to Push', 'Muscle Up', 'Pull', 'reps', [
      { label: 'Premier', target: 1, level: 'Full' },
      { label: 'Base', target: 3, level: 'Full' },
      { label: 'Strong', target: 5, level: 'Full' },
      { label: 'Elite', target: 8, level: 'Full' },
    ], ['pullups', 'dips'])
  ];

  // Second pass to compute isLocked status based on prerequisites
  for (const skill of skills) {
    if (skill.prerequisites.length > 0) {
      skill.isLocked = skill.prerequisites.some(preId => {
        const preSkill = skills.find(s => s.id === preId);
        // A prerequisite is considered unmet if its first milestone is NOT unlocked
        return !preSkill || !preSkill.milestones[0].unlocked;
      });
    }
  }

  return skills;
}

// ─────────────────────────────────────────────────────────────
// XP & Level System
// ─────────────────────────────────────────────────────────────
export function calculateXP(logs: TrainingLog[]): number {
  let xp = 0;
  for (const log of logs) {
    xp += 25;
    if (log.energy_level >= 8) xp += 10;
    if (log.cycle_type === 'Force') xp += 15;
    
    // Exam bonus
    if (log.is_exam) xp += 100;

    if (log.sets) {
      // Bonus for super sets
      if (log.sets.length > 1) xp += 20 * (log.sets.length - 1);
      // Bonus for level
      if (log.sets.some(s => s.level === 'Full')) xp += 20;
    } else {
      if (log.level === 'Full') xp += 20;
    }
  }
  return xp;
}

export function getLevel(xp: number) {
  const levels = [
    { threshold: 0, title: 'Rookie' },
    { threshold: 100, title: 'Initiate' },
    { threshold: 300, title: 'Apprentice' },
    { threshold: 600, title: 'Fighter' },
    { threshold: 1000, title: 'Warrior' },
    { threshold: 1500, title: 'Veteran' },
    { threshold: 2200, title: 'Elite' },
    { threshold: 3000, title: 'Master' },
    { threshold: 4000, title: 'Grandmaster' },
    { threshold: 5500, title: 'Legend' },
    { threshold: 7500, title: 'Mythic' },
    { threshold: 10000, title: 'Gravity Unbound' },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold = currentLevel < levels.length - 1
    ? levels[currentLevel + 1].threshold
    : levels[currentLevel].threshold + 2500;

  return {
    level: currentLevel + 1,
    title: levels[currentLevel].title,
    xpInLevel: xp - currentThreshold,
    xpForNext: nextThreshold - currentThreshold,
  };
}

export function calculateStreak(logs: TrainingLog[]): number {
  if (logs.length === 0) return 0;
  const weekSet = new Set<string>();
  for (const log of logs) {
    weekSet.add(getISOWeek(new Date(log.created_at)));
  }
  const sortedWeeks = Array.from(weekSet).sort().reverse();
  if (sortedWeeks.length === 0) return 0;

  const currentWeek = getISOWeek(new Date());
  const lastWeek = getISOWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  
  let streak = 0;
  let checkWeek = currentWeek;

  if (sortedWeeks[0] === currentWeek || sortedWeeks[0] === lastWeek) {
    checkWeek = sortedWeeks[0];
  } else {
    return 0;
  }

  for (const week of sortedWeeks) {
    if (week === checkWeek) {
      streak++;
      const d = parseISOWeek(checkWeek);
      d.setDate(d.getDate() - 7);
      checkWeek = getISOWeek(d);
    } else if (week < checkWeek) {
      break;
    }
  }

  return streak;
}

function getISOWeek(date: Date): string {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function parseISOWeek(weekStr: string): Date {
  const [yearStr, weekPart] = weekStr.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekPart);
  const d = new Date(year, 0, 4);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + (week - 1) * 7);
  return d;
}

export function getReadinessScore(logs: TrainingLog[]): number {
  if (logs.length === 0) return 10;
  const recentLogs = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  const last3DaysLogs = recentLogs.filter(l => new Date(l.created_at) >= threeDaysAgo);
  
  if (last3DaysLogs.length === 0) return 10; // Fully rested
  
  const avgEnergy = last3DaysLogs.reduce((acc, l) => acc + l.energy_level, 0) / last3DaysLogs.length;
  return Math.round(avgEnergy);
}

export function getReadinessText(score: number): string {
  if (score >= 8) return "Excellente forme. C'est le moment de tenter des PRs ou d'augmenter le volume.";
  if (score >= 5) return "Forme modérée. Séance classique, concentre-toi sur l'exécution.";
  return "Fatigue détectée. Privilégie une séance de décharge ou du travail technique léger.";
}
