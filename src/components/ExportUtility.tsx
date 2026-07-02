import { db } from '../lib/db';
import { Download } from 'lucide-react';

export default function ExportUtility() {
  return (
    <button
      onClick={() => db.exportToCSV()}
      className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-brand-text/30 hover:text-brand-text/60 transition-colors font-bold py-3"
    >
      <Download size={12} />
      Export Data Matrix (CSV)
    </button>
  );
}
