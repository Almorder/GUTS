import { db } from '../lib/db';

export default function ExportUtility() {
  return (
    <button 
      onClick={() => db.exportToCSV()}
      className="text-xs uppercase tracking-widest text-brand-text/40 hover:text-brand-text border-b border-brand-border hover:border-brand-text pb-1 transition-colors font-bold"
    >
      Export Data Matrix (CSV)
    </button>
  );
}
