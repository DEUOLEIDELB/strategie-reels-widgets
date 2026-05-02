# Blocker : pivot Atelier vers cascade canvas + ateliers nommés

**Vue** : atelier
**Type** : schéma Grist + dépendance npm + hooks shared (hors zone agent)
**Date** : 2026-05-02
**Statut** : ouvert

## Quoi

Pivot du spec V1 (`03-atelier.md`) vers une nouvelle UX basée sur :

1. **Canvas en cascade orientée gauche → droite** (React Flow + auto-layout dagre) à la place du layout 3 colonnes statiques (Navigateur / Canvas grid / Panneau).
2. **Ateliers nommés** : un atelier = un workspace de composition visuelle avec son propre arbre de briques (Avatar → Angle → Pain → Reel). Plusieurs ateliers cohabitent, switch via dropdown header, duplication possible.
3. **Persistance native** des positions visuelles + connexions dans Grist (table Ateliers, champ JSON `canvas_state`).

Cela demande :

- **Nouvelle table Grist `Ateliers`** (delta minimal, voir schéma plus bas).
- **2 deps npm** : `@xyflow/react` (React Flow, MIT) + `dagre` (auto-layout, MIT).
- **Hooks shared `useAteliers*`** dans `src/shared/hooks/grist/useAteliers.ts`.
- **Extension du store** `currentAtelierId` dans `src/shared/store.ts`.

## Pourquoi

Demande PO directe (Taki, conversation 2026-05-02) :

- L'atelier doit être un **outil de composition visuel**, pas une grille filtrée. Modèle mental "ruissellement" : 1 avatar → N angles → N pains → N reels, l'arbre se construit en cascade.
- **Versionnable** : "j'ai plein de tests en direct, je veux pouvoir naviguer entre les versions". Une version = un atelier nommé indépendant.
- **Multi-utilisateur** : "si un autre utilisateur ouvre, il voit la même chose". Persistance Grist obligatoire (pas de localStorage).
- **Visuellement comme Figma/Miro/Excalidraw** mais structuré pour notre use case : drag-drop fluide, déplacement, sauvegarde de la disposition.

Le V1 actuel répond à 80% du modèle conceptuel mais rate la dimension "canvas visuel" et "versions". Plutôt que de patcher, on pivote proprement.

## Schéma Grist proposé

### Nouvelle table `Ateliers`

| Colonne | Type | Notes |
|---|---|---|
| `id` | auto | clé primaire Grist standard |
| `nom` | Text | "Test 1 — Sophie écrans", "Variation Pingtok"... |
| `description` | Text | optionnel, contexte du test |
| `canvas_state` | Text | JSON sérialisé `{nodes: ReactFlowNode[], edges: ReactFlowEdge[]}` |
| `parent_atelier` | Ref:Ateliers | si fork/duplication, pointe l'atelier source |
| `created_at` | DateTime | auto à la création |
| `updated_at` | DateTime | mis à jour à chaque save canvas |

### Tables touchées

**Aucune.** Avatar, Angles, Pain_points, Reels gardent leurs schémas actuels et restent des **pools globaux** (réutilisables entre Ateliers). C'est la structure visuelle (nodes/edges) qui appartient à un Atelier, pas les briques.

## Options envisagées

### A — Canvas libre style Excalidraw (rejetée)

Tldraw / Excalidraw embed avec placement 100% manuel.

- ✅ Liberté totale.
- ❌ Pas adapté à un arbre orienté avec sémantique (Avatar → Angle → ...).
- ❌ Trop de friction utilisateur pour placer chaque carte.
- ❌ Pas d'auto-layout = le canvas devient le bordel après 20 cartes.

### B — React Flow + dagre auto-layout (retenue)

- ✅ Graphe orienté natif, custom nodes typés par catégorie.
- ✅ Auto-layout dagre G→D : on ajoute une carte, l'arbre se range.
- ✅ Drag-drop manuel possible quand on veut ajuster.
- ✅ Sérialisation JSON triviale → Grist.
- ✅ MIT, mature, ~500k weekly downloads.
- ⚠️ +1 dep ~80kb gzip + dagre ~30kb gzip (acceptable pour un outil interne).

### C — Layout CSS Grid en colonnes (rejetée)

Cascade en HTML/CSS pure, connexions par SVG paths.

- ✅ Zéro dep.
- ❌ Pas de zoom/pan/canvas infini.
- ❌ Pas de drag-drop libre.
- ❌ Effort de placement et de gestion des liens à réimplémenter.

## Recommandation

**Option B**. Coût mesuré, retour proportionné.

## Action proposée

Comme l'agent Atelier ne peut pas toucher à `shared/`, `app/`, ni aux configs, et que le PO m'a dit "à toi de jouer" dans la conversation, je propose de procéder ainsi (en attendant validation explicite ou bascule de rôles) :

1. **PO ou agent infra** :
   - [ ] Crée table Grist `Ateliers` via MCP (doc `o8yNauYWgjtjcnTJyKURyk`).
   - [ ] `npm install @xyflow/react dagre @types/dagre`.
   - [ ] Ajoute `useAteliers.ts` dans `src/shared/hooks/grist/` + export dans `index.ts`.
   - [ ] Ajoute `Atelier` à `src/shared/lib/types.ts`.
   - [ ] Étend `src/shared/store.ts` avec `currentAtelierId` + `setCurrentAtelier` (persisté localStorage).

2. **Agent Atelier (moi)** :
   - [ ] Implémente `src/views/atelier/` : `AtelierShell`, `AtelierSelector`, `CanvasFlow`, custom nodes, sidebar bibliothèque.
   - [ ] Captures dans `docs/screenshots/atelier/`.
   - [ ] `npm run build` propre, parcours nominal validé Chrome.

## Hors-scope

- Métriques de performance (toujours hors V1).
- Édition fine du contenu d'une brique (CRUD complet) : V1 = tu ajoutes/retires des briques de l'arbre, l'édition de leur contenu reste via le panneau Brique simplifié (lecture + champs principaux). CRUD complet plus tard.
- Annulation/historique (undo/redo) sur le canvas : V2.
- Diff visuel entre 2 ateliers : V2.

## Definition of Done V1

Boki doit pouvoir :

- [ ] Créer un nouvel Atelier nommé.
- [ ] Drag-drop un Avatar de la sidebar vers le canvas → apparaît comme node.
- [ ] Cliquer + sur un Avatar node → ajoute un Angle enfant connecté (depuis pool ou nouveau).
- [ ] Idem Angle → Pain, Pain → Reel.
- [ ] L'arbre se ré-organise auto en cascade G→D.
- [ ] Quitter l'app, revenir : l'arbre est intact (Grist persiste).
- [ ] Switcher entre 2 Ateliers via dropdown header.
- [ ] Dupliquer un Atelier (fork) pour itérer sans casser.
- [ ] Renommer / supprimer un Atelier (avec ConfirmDialog).
- [ ] Aucune erreur console, build propre.
