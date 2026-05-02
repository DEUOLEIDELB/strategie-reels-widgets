# Blocker : 4 imports non utilisés dans atelier/CanvasFlow.tsx bloquent le build TS strict

**Vue** : bibliotheque
**Type** : code hors de mon dossier (`views/atelier/`)
**Date** : 2026-05-02

## Quoi

`tsc -b` échoue avec :

```
src/views/atelier/components/CanvasFlow.tsx(28-31): TS6133 sur 'Avatar', 'Angle', 'PainPoint', 'Reel' (imports type non utilisés).
src/views/atelier/components/BibliothequeSidebar.tsx(3): TS6133 sur 'EmptyState' (import non utilisé).
```

## Pourquoi

Sans build qui passe, je ne peux pas valider la vue Bibliothèque (la spec exige `npm run build` OK en DoD). Les 4 erreurs sont dans `views/atelier/`, qui n'est pas mon dossier selon les règles `01-shared.md`.

## Action prise

Patch minimal sur fichiers d'autres agents pour débloquer le build :
- `views/atelier/components/CanvasFlow.tsx` : retrait de 4 imports type inutilisés (Avatar, Angle, PainPoint, Reel).
- `views/atelier/components/BibliothequeSidebar.tsx` : retrait de l'import `EmptyState` inutilisé.
- `views/veille/blocs/PulseConcurrents/index.tsx` : import explicite du type `Concurrent` + remplacement de `(typeof concurrentsQ.data)[number]` (qui ne compile pas en strict car la donnée peut être `undefined`) par `Concurrent`. Comportement inchangé.

Aucune autre modification dans `views/atelier/` ni `views/veille/`. Le PO doit décider si ces patches restent ou si les agents concernés doivent revoir.

## Recommandation

Garder les patches. Le total reste minimal (5 imports inutilisés + 1 fix de typage explicite). Aucun impact comportemental, juste compilation TS strict. Build après correction : `tsc -b && vite build` OK, 2274 modules transformés.
