import type { TrainingLog } from './db';

// ─────────────────────────────────────────────────────────────
// Nolan's real milestones from his design document
// ─────────────────────────────────────────────────────────────

export interface Milestone {
  label: string;
  target: number;
  unit: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string; // emoji
  subtitle: string;
  current: number;
  milestones: Milestone[];
  movement: string;
  mechanic: string;
  level?: string;
}

// Parse a performance string to extract a numeric value
function parsePerformance(perf: string): number {
  // Match patterns like "3s", "3 sec", "3 seconds", "5s"
  const secMatch = perf.match(/(\d+\.?\d*)\s*s/i);
  if (secMatch) return parseFloat(secMatch[1]);

  // Match patterns like "2 reps", "5 rep", "3r"
  const repMatch = perf.match(/(\d+\.?\d*)\s*r/i);
  if (repMatch) return parseFloat(repMatch[1]);

  // Match bare numbers
  const numMatch = perf.match(/^(\d+\.?\d*)/);
  if (numMatch) return parseFloat(numMatch[1]);

  return 0;
}

// Get the best performance for a specific skill from logs
export function getBestPerformance(
  logs: TrainingLog[],
  movement: string,
  mechanic: string,
  level?: string
): number {
  const filtered = logs.filter(
    l =>
      l.movement === movement &&
      l.mechanic === mechanic &&
      (!level || l.level === level)
  );

  if (filtered.length === 0) return 0;

  return Math.max(...filtered.map(l => parsePerformance(l.top_set_performance)));
}

// Calculate progress percentage for a skill based on its milestones
export function getSkillProgress(skill: Skill): number {
  if (skill.milestones.length === 0) return 0;
  const finalTarget = skill.milestones[skill.milestones.length - 1].target;
  if (finalTarget === 0) return 0;
  return Math.min((skill.current / finalTarget) * 100, 100);
}

// Get the next milestone that hasn't been reached
export function getNextMilestone(skill: Skill): Milestone | null {
  for (const m of skill.milestones) {
    if (skill.current < m.target) return m;
  }
  return null;
}

// Get the current milestone tier (0-indexed)
export function getCurrentTier(skill: Skill): number {
  let tier = 0;
  for (const m of skill.milestones) {
    if (skill.current >= m.target) tier++;
  }
  return tier;
}

// ─────────────────────────────────────────────────────────────
// Build skills from Nolan's ACTUAL objectives
// ─────────────────────────────────────────────────────────────
export function buildSkills(logs: TrainingLog[]): Skill[] {
  return [
    {
      id: 'fl-hold',
      name: 'Front Lever',
      icon: '🔒',
      subtitle: 'Hold · Full',
      current: Math.max(3, getBestPerformance(logs, 'Front Lever', 'Hold', 'Full')),
      milestones: [
        { label: 'Base', target: 3, unit: 's' },
        { label: 'Solid', target: 5, unit: 's' },
        { label: 'Elite', target: 8, unit: 's' },
        { label: 'Master', target: 10, unit: 's' },
      ],
      movement: 'Front Lever',
      mechanic: 'Hold',
      level: 'Full',
    },
    {
      id: 'fl-pull',
      name: 'FL Pull-ups',
      icon: '⚡',
      subtitle: 'Pull · Adv Tuck',
      current: Math.max(2, getBestPerformance(logs, 'Front Lever', 'Pull', 'Adv Tuck')),
      milestones: [
        { label: 'Base', target: 2, unit: 'reps' },
        { label: 'Solid', target: 3, unit: 'reps' },
        { label: 'Target', target: 5, unit: 'reps' },
        { label: 'Elite', target: 8, unit: 'reps' },
      ],
      movement: 'Front Lever',
      mechanic: 'Pull',
      level: 'Adv Tuck',
    },
    {
      id: 'hs',
      name: 'Handstand',
      icon: '🤸',
      subtitle: 'Hold · Free',
      current: Math.max(15, getBestPerformance(logs, 'Handstand', 'Hold', 'Full')),
      milestones: [
        { label: 'Base', target: 15, unit: 's' },
        { label: 'Solid', target: 30, unit: 's' },
        { label: 'Clean', target: 45, unit: 's' },
        { label: 'Master', target: 60, unit: 's' },
      ],
      movement: 'Handstand',
      mechanic: 'Hold',
      level: 'Full',
    },
    {
      id: 'planche',
      name: 'Planche',
      icon: '🔥',
      subtitle: 'Hold · Tuck',
      current: getBestPerformance(logs, 'Planche', 'Hold', 'Tuck'),
      milestones: [
        { label: 'Init', target: 3, unit: 's' },
        { label: 'Base', target: 5, unit: 's' },
        { label: 'Solid', target: 8, unit: 's' },
        { label: 'Adv Tuck', target: 10, unit: 's' },
      ],
      movement: 'Planche',
      mechanic: 'Hold',
      level: 'Tuck',
    },
    {
      id: 'pullups',
      name: 'Pull-ups',
      icon: '💪',
      subtitle: 'Strict Pronation',
      current: Math.max(17, getBestPerformance(logs, 'Accessoire', 'Pull')),
      milestones: [
        { label: 'Current', target: 17, unit: 'reps' },
        { label: 'Strong', target: 20, unit: 'reps' },
        { label: 'Historic', target: 24, unit: 'reps' },
        { label: 'Beyond', target: 28, unit: 'reps' },
      ],
      movement: 'Accessoire',
      mechanic: 'Pull',
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// XP & Level System
// ─────────────────────────────────────────────────────────────
export function calculateXP(logs: TrainingLog[]): number {
  let xp = 0;
  for (const log of logs) {
    // Base XP per log
    xp += 25;
    // Bonus for high energy
    if (log.energy_level >= 8) xp += 10;
    // Bonus for Force cycle (harder)
    if (log.cycle_type === 'Force') xp += 15;
    // Bonus for Full level (most advanced)
    if (log.level === 'Full') xp += 20;
  }
  return xp;
}

export function getLevel(xp: number): { level: number; title: string; xpInLevel: number; xpForNext: number } {
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

// ─────────────────────────────────────────────────────────────
// Streak System
// ─────────────────────────────────────────────────────────────
export function calculateStreak(logs: TrainingLog[]): number {
  if (logs.length === 0) return 0;

  // Group logs by ISO week
  const weekSet = new Set<string>();
  for (const log of logs) {
    const d = new Date(log.created_at);
    const week = getISOWeek(d);
    weekSet.add(week);
  }

  const sortedWeeks = Array.from(weekSet).sort().reverse();
  if (sortedWeeks.length === 0) return 0;

  // Check if current week is active
  const currentWeek = getISOWeek(new Date());
  const lastWeek = getISOWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  let streak = 0;
  let checkWeek = currentWeek;

  // Allow current week or last week as starting point
  if (sortedWeeks[0] === currentWeek || sortedWeeks[0] === lastWeek) {
    checkWeek = sortedWeeks[0];
  } else {
    return 0;
  }

  for (const week of sortedWeeks) {
    if (week === checkWeek) {
      streak++;
      // Calculate previous week
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
