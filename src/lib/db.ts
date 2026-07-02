export type CycleType = 'Force' | 'Volume' | 'Décharge';
export type Movement = 'Front Lever' | 'Planche' | 'Handstand' | 'Accessoire';
export type Mechanic = 'Hold' | 'Pull' | 'Negative' | 'Raise';
export type Level = 'Tuck' | 'Adv Tuck' | 'Half Lay' | 'Full';

export interface TrainingLog {
  id: string;
  created_at: string;
  cycle_type: CycleType;
  movement: Movement;
  mechanic: Mechanic;
  level: Level;
  top_set_performance: string;
  energy_level: number;
  notes: string;
}

const STORAGE_KEY = 'NolanArc_TrainingLogs';
const CHANGELOG_KEY = 'NolanArc_Changelog';

export const db = {
  getLogs: (): TrainingLog[] => {
    const data = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return newLog;
  },

  getChangelog: (): string => {
    return localStorage.getItem(CHANGELOG_KEY) || '';
  },

  saveChangelog: (text: string): void => {
    localStorage.setItem(CHANGELOG_KEY, text);
  },

  exportToCSV: (): void => {
    const logs = db.getLogs();
    if (logs.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const headers = ['id', 'created_at', 'cycle_type', 'movement', 'mechanic', 'level', 'top_set_performance', 'energy_level', 'notes'];
    
    const rows = logs.map(log => {
      return headers.map(header => {
        let val = (log as any)[header]?.toString() || '';
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NolanArc_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
