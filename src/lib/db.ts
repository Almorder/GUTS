export type CycleType = 'Force' | 'Volume' | 'Décharge';
export type Movement = 'Front Lever' | 'Planche' | 'Handstand' | 'Tractions' | 'Dips' | 'L-sit' | 'Renforcement' | 'Accessoire';
export type Mechanic = 'Hold' | 'Pull' | 'Negative' | 'Raise';
export type Level = 'Tuck' | 'Adv Tuck' | 'Half Lay' | 'Full';

export interface SubSet {
  movement: Movement;
  mechanic: Mechanic;
  level: Level;
  reps?: number; // Repetitions actually done
  duration?: number; // Time in seconds actually done
  weight?: number; // Added weight in kg (can be negative for assistance)
  targetReps?: number; // Predicted coach target
  targetDuration?: number; // Predicted coach target
  targetWeight?: number; // Predicted coach target
  targetRest?: number; // Recommended rest in seconds after this set
  isSuperSet?: boolean; // If true, immediately jump to the next set without rest
}

export interface TrainingLog {
  id: string;
  created_at: string;
  cycle_type: CycleType;
  
  // V2 Legacy (optional now)
  movement?: Movement;
  mechanic?: Mechanic;
  level?: Level;
  top_set_performance?: string;
  notes?: string;

  // V3 Features
  is_exam?: boolean;
  sets?: SubSet[]; // array for Super Sets
  tags?: string[];
  energy_level: number;
}

export interface TrainingProgram {
  id: string;
  created_at: string;
  week_start: string; // ISO date
  schedule: {
    day: string; // "Lundi", "Mardi"...
    hour: string;
    focus: string[]; // ex: ["Front Lever", "Accessoire"]
    structured_focus?: SubSet[]; // V6 Interactive Sets
  }[];
}

const LOGS_KEY = 'NolanArc_TrainingLogs';
const PROGRAMS_KEY = 'NolanArc_Programs';
const CHANGELOG_KEY = 'NolanArc_Changelog';

export const db = {
  getLogs: (): TrainingLog[] => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addLog: (log: Omit<TrainingLog, 'id' | 'created_at'>): TrainingLog => {
    const newLog: TrainingLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const logs = db.getLogs();
    logs.push(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return newLog;
  },

  updateLog: (id: string, updatedFields: Partial<TrainingLog>): void => {
    const logs = db.getLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updatedFields };
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
  },

  deleteLog: (id: string): void => {
    const logs = db.getLogs().filter(l => l.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },

  getPrograms: (): TrainingProgram[] => {
    const data = localStorage.getItem(PROGRAMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addProgram: (prog: Omit<TrainingProgram, 'id' | 'created_at'>): TrainingProgram => {
    const newProg: TrainingProgram = {
      ...prog,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const progs = db.getPrograms();
    progs.push(newProg);
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(progs));
    return newProg;
  },

  getChangelog: (): string => {
    return localStorage.getItem(CHANGELOG_KEY) || '';
  },

  saveChangelog: (text: string): void => {
    localStorage.setItem(CHANGELOG_KEY, text);
  },

  exportToCSV: (): void => {
    const logs = db.getLogs();
    if (logs.length === 0) return;

    // Flatten V3 arrays for CSV
    const rows = logs.map(log => {
      // For V2 legacy
      const mov = log.sets && log.sets.length > 0 ? log.sets.map(s => s.movement).join(' + ') : log.movement || '';
      const mec = log.sets && log.sets.length > 0 ? log.sets.map(s => s.mechanic).join(' + ') : log.mechanic || '';
      const lvl = log.sets && log.sets.length > 0 ? log.sets.map(s => s.level).join(' + ') : log.level || '';
      
      const perf = log.sets && log.sets.length > 0 
        ? log.sets.map(s => {
            const parts = [];
            if (s.reps) parts.push(`${s.reps}r`);
            if (s.duration) parts.push(`${s.duration}s`);
            if (s.weight) parts.push(`+${s.weight}kg`);
            return parts.join(' ');
          }).join(' + ')
        : log.top_set_performance || '';

      const tgs = log.tags ? log.tags.join(' | ') : log.notes || '';

      return [
        log.id,
        log.created_at,
        log.cycle_type,
        log.is_exam ? 'YES' : 'NO',
        mov,
        mec,
        lvl,
        perf,
        log.energy_level,
        tgs
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const headers = ['id', 'created_at', 'cycle_type', 'is_exam', 'movement', 'mechanic', 'level', 'performance', 'energy_level', 'tags_notes'].join(',');
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GUTS_Export_V3_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToJSON: (): void => {
    const data = {
      logs: db.getLogs(),
      programs: db.getPrograms()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nolan_arc_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  importFromJSON: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.logs && Array.isArray(data.logs)) {
        localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
      }
      if (data.programs && Array.isArray(data.programs)) {
        localStorage.setItem(PROGRAMS_KEY, JSON.stringify(data.programs));
      }
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};
