# Lessons Learned

[2026-07-04] | ActiveSessionModal écrasait les targetReps/targetDuration du scheduler avec 0 | Toujours utiliser `??` (nullish coalescing) pour préserver les valeurs du scheduler
[2026-07-04] | Scheduler codait en dur `level: 'Full'` pour tous les exercices | Créer une fonction `getBestLevel()` qui détecte le meilleur niveau de l'utilisateur
[2026-07-04] | Dips était classé comme 'Pull' au lieu de 'Push' | Vérifier la sémantique des types avant d'assigner un mechanic
[2026-07-04] | LogModal ne listait pas les nouveaux mouvements/niveaux ajoutés | Quand on ajoute un Movement ou Level dans db.ts, TOUJOURS mettre à jour LogModal.tsx
[2026-07-04] | Bouton delete invisible sur mobile (hover-only) | Ne jamais utiliser opacity-0 group-hover pour des actions critiques sur mobile
[2026-07-04] | `&&` ne fonctionne pas comme séparateur de commandes en PowerShell | Utiliser des commandes séparées
