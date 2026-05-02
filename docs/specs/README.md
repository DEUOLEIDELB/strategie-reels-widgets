# Specs — strategie-reels-widgets

Documents de référence pour le PO et les agents (dev + designer).

## Ordre de lecture

| Doc | Public | Quand lire |
|---|---|---|
| `00-grist-delta.md` | PO | Référence du schéma Grist final. APPLIQUÉ. |
| `01-shared.md` | TOUS | Avant la première ligne de code, intégralement. |
| `02-design-system.md` | TOUS | Avant de coder un composant ou un layout. |
| `03-atelier.md` | Agent(s) Atelier | Après shared + design system. |
| `04-bibliotheque.md` | Agent(s) Bibliothèque | Idem. |
| `05-veille.md` | Agent(s) Veille | Idem. |

## Modèle de données (rappel)

```
Avatar (n)         pool indépendant
Angle (n)          N:N avec Avatar (Angles.avatars)
Pain (n)           N:N avec Avatar et Angles
Reel               (avatar, angle, probleme) + hook + body + cta + angle_precis
```

Pas de table Pillier. Pas de table Campagne. La "combinaison" = un Reel.

## Process de dispatch

1. ✓ Boki valide le modèle (fait).
2. ✓ PO applique delta Grist (fait, 7 colonnes).
3. ✓ PO écrit les specs (fait).
4. → PO met en place `src/shared/`, `src/app/`, atomes design system.
5. → PO commit Phase 0a.
6. → Boki review visuel (Playground page).
7. → Boki dispatche les 3 vues à des agents (dev + éventuellement designer).
8. → Chaque agent ne touche QUE son dossier `src/views/<sa-vue>/`.
9. → PO review les PRs et merge.

## Blockers

Si tu es agent et bloqué : crée `docs/specs/blockers/<vue>-<YYYY-MM-DD>-<slug>.md`. Le PO traite et déloque.

