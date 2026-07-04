import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { BodyState } from '../lib/db';
import BodyMap from '../components/BodyMap';

export default function BodyMapPage() {
  const [state, setState] = useState<BodyState>(db.getBodyState());

  useEffect(() => {
    db.saveBodyState(state);
  }, [state]);

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="px-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Auto-Régulation</h1>
        <p className="text-sm text-brand-text/60">Indique à l'IA ton état physique. Le planificateur adaptera tes séances pour éviter les blessures.</p>
      </div>

      <div className="px-5 mt-4">
        <BodyMap state={state} onChange={setState} />
      </div>
      
      <div className="px-5 mt-6">
        <div className="bg-brand-text/5 border border-brand-border/40 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <span className="text-xl">🤖</span> L'IA du Coach
          </h3>
          <p className="text-xs text-brand-text/70 leading-relaxed mb-4">
            L'algorithme de planification lit ces données en temps réel :
          </p>
          <ul className="text-xs text-brand-text/60 space-y-3 flex flex-col">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0" />
              <span><strong className="text-orange-500">Courbatures :</strong> Le volume et l'intensité des exercices ciblant cette zone seront réduits de 30% (Récupération active).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
              <span><strong className="text-red-500">Douleur / Blessure :</strong> Les séances ciblant principalement cette zone seront totalement bannies du programme généré.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
