import type { TrainingLog, TrainingProgram } from './db';

const FOCUS_AREAS = [
  ['Front Lever', 'Pull-ups'],
  ['Handstand', 'Planche'],
  ['Core', 'Mobility'],
  ['Endurance', 'Accessoire']
];

export function generateProgram(
  availableDays: string[], 
  availableHours: string, 
  logs: TrainingLog[]
): Omit<TrainingProgram, 'id' | 'created_at'> {
  // Check average energy over last 7 days
  const recentLogs = [...logs]
    .filter(l => new Date(l.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const avgEnergy = recentLogs.length > 0 
    ? recentLogs.reduce((acc, l) => acc + l.energy_level, 0) / recentLogs.length
    : 7; // Default to 7 if no recent logs

  const isDeload = avgEnergy < 5;

  const schedule = availableDays.map((day, index) => {
    // Round-robin focus areas based on index
    const focus = isDeload 
      ? ['Mobility', 'Light Technique'] 
      : FOCUS_AREAS[index % FOCUS_AREAS.length];

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
