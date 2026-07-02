import type { TrainingLog, TrainingProgram, CycleType } from './db';

const FOCUS_MAPPING: Record<CycleType, string[][]> = {
  'Force': [
    ['Front Lever Hold (Max)', 'Planche Lean (Max)'],
    ['Weighted Pull-ups', 'Core Force'],
    ['Handstand Push-ups', 'Front Lever Negatives'],
    ['Planche Tuck Hold', 'Heavy Accessoire']
  ],
  'Volume': [
    ['Front Lever (Submax) + Accessoire', 'Endurance'],
    ['Planche (Submax) + Core', 'Volume Push'],
    ['Handstand Technique', 'Volume Pull'],
    ['Full Body Basics', 'Endurance Core']
  ],
  'Décharge': [
    ['Mobility & Stretching', 'Light Technique'],
    ['Active Recovery', 'Joint Prep'],
    ['Light Handstand', 'Core Flow'],
    ['Yoga / Flexibility', 'Prehab']
  ]
};

export function generateProgram(
  availableDays: string[], 
  availableHours: string, 
  logs: TrainingLog[],
  targetCycle: CycleType
): Omit<TrainingProgram, 'id' | 'created_at'> {
  
  const pool = FOCUS_MAPPING[targetCycle];

  const schedule = availableDays.map((day, index) => {
    const focus = pool[index % pool.length];
    return {
      day,
      hour: availableHours,
      focus
    };
  });

  return {
    week_start: new Date().toISOString(),
    schedule
  };
}
