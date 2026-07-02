import type { TrainingLog, TrainingProgram, CycleType, SubSet } from './db';

interface SessionTemplate {
  focusStrs: string[];
  sets: SubSet[];
}

const FOCUS_MAPPING: Record<CycleType, SessionTemplate[]> = {
  'Force': [
    {
      focusStrs: ['Front Lever Max', 'Tractions Lourdes'],
      sets: [
        { movement: 'Front Lever', mechanic: 'Hold', level: 'Full', duration: 5 },
        { movement: 'Tractions', mechanic: 'Pull', level: 'Full', reps: 3, weight: 20 },
        { movement: 'Renforcement', mechanic: 'Hold', level: 'Full', duration: 30 }
      ]
    },
    {
      focusStrs: ['Planche', 'Dips Lourds'],
      sets: [
        { movement: 'Planche', mechanic: 'Hold', level: 'Tuck', duration: 10 },
        { movement: 'Dips', mechanic: 'Pull', level: 'Full', reps: 5, weight: 30 }
      ]
    },
    {
      focusStrs: ['Handstand', 'L-sit'],
      sets: [
        { movement: 'Handstand', mechanic: 'Hold', level: 'Full', duration: 30 },
        { movement: 'L-sit', mechanic: 'Hold', level: 'Full', duration: 15 }
      ]
    }
  ],
  'Volume': [
    {
      focusStrs: ['Front Lever (Reps)', 'Tractions Volume'],
      sets: [
        { movement: 'Front Lever', mechanic: 'Pull', level: 'Adv Tuck', reps: 5 },
        { movement: 'Tractions', mechanic: 'Pull', level: 'Full', reps: 15 }
      ]
    },
    {
      focusStrs: ['Dips Volume', 'Renforcement'],
      sets: [
        { movement: 'Dips', mechanic: 'Pull', level: 'Full', reps: 20 },
        { movement: 'Renforcement', mechanic: 'Hold', level: 'Full', reps: 15 }
      ]
    }
  ],
  'Décharge': [
    {
      focusStrs: ['Mobility', 'Handstand Technique'],
      sets: [
        { movement: 'Handstand', mechanic: 'Hold', level: 'Full', duration: 15 },
        { movement: 'L-sit', mechanic: 'Hold', level: 'Full', duration: 10 }
      ]
    }
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
    const template = pool[index % pool.length];
    return {
      day,
      hour: availableHours,
      focus: [...template.focusStrs],
      structured_focus: JSON.parse(JSON.stringify(template.sets)) // Deep copy
    };
  });

  return {
    week_start: new Date().toISOString(),
    schedule
  };
}
