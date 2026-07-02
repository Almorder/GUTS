import Header from '../components/Header';
import ExportUtility from '../components/ExportUtility';

export default function Settings() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-2 min-h-screen">
      <Header />
      <div className="mt-10">
        <h2 className="font-serif text-xl font-bold mb-6">Paramètres & Data</h2>
        
        <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
          <h3 className="text-sm font-bold mb-2">Gestion des Données</h3>
          <p className="text-xs text-brand-text/50 mb-4">
            Génère la matrice brute de toutes tes performances, tags, examens et combos au format CSV pour l'archiver ou l'analyser dans Excel.
          </p>
          <ExportUtility />
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl p-4 mt-6 opacity-50">
          <h3 className="text-sm font-bold mb-2 flex items-center justify-between">
            <span>Éditeur de Mouvements</span>
            <span className="text-[9px] uppercase tracking-widest bg-brand-border/30 px-2 py-0.5 rounded">Prochainement</span>
          </h3>
          <p className="text-xs text-brand-text/50">
            Interface pour modifier la base d'exercices (ajouter la Planche Full, le One Arm Pull-up, etc.) et définir tes propres paliers d'examens.
          </p>
        </div>
      </div>
    </div>
  );
}
