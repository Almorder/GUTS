import { db } from '../lib/db';
import { Download, Upload } from 'lucide-react';

export default function ExportUtility() {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = db.importFromJSON(event.target?.result as string);
      if (success) {
        alert("Import réussi ! L'application va se recharger.");
        window.location.href = '/GUTS/';
      } else {
        alert("Erreur lors de l'importation. Le fichier est invalide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => db.exportToJSON()}
        className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-brand-text/60 bg-brand-text/5 hover:bg-brand-text/10 rounded-xl transition-colors font-bold py-3"
      >
        <Download size={14} />
        Sauvegarder les données (JSON)
      </button>
      
      <label className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-brand-text/60 bg-brand-text/5 hover:bg-brand-text/10 rounded-xl transition-colors font-bold py-3 cursor-pointer">
        <Upload size={14} />
        Restaurer les données (JSON)
        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>

      <button
        onClick={() => db.exportToCSV()}
        className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-brand-text/30 hover:text-brand-text/60 transition-colors font-bold py-2 mt-2"
      >
        <Download size={12} />
        Export Data Matrix (CSV Legacy)
      </button>
    </div>
  );
}
