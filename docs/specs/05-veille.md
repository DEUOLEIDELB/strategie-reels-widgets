# Vue 03 : VEILLE

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

## Objectif

Inspiration externe. **Read-only**. Source d'idées qu'on transforme manuellement en briques (Atelier ou Bibliothèque).

C'est une bibliothèque de référence. Pas d'action complexe : browse + click + lire.

## Layout

Une page, 3 tabs : **Vidéos virales** / **Concurrents** / **Tendances**.

## Tabs

### 1. Vidéos virales (table `Videos_virales`)
**Affichage :** grid de cards larges (3 par row desktop).
**Card :**
- Thumbnail (placeholder neutre si vide)
- `createur`
- `titre_ou_description` (2 lignes ellipsis)
- `vues_likes` (badge)
- `plateforme` (icon : tiktok / instagram / youtube)
- Badge `categorie_pain_point`
- Badge S/A/B/C coloré pour `tier_reproductibilite` (S=violet, A=vert, B=jaune, C=gris)
- Lien externe `source_url` (icône)

**Filtres :** `plateforme` (Choice), `tier_reproductibilite` (Choice multi), `categorie_pain_point` (Choice).

**Drawer détail :**
- Tous les champs de la card en plein
- `pourquoi_a_perce` (paragraphe)
- `hook_pour_wubo` (encadré jaune `accent-soft`)
- `signal_algo` (chips)
- Bouton `Ouvrir la source ↗`

### 2. Concurrents (table `Concurrents`)
**Affichage :** grid de cards classiques (3-4 par row).
**Card :**
- `nom`, lien `username_ig` (icône Instagram)
- Stats : `followers_ig` + `followers_tiktok` (badges)
- `prix`, `cible_age`, preview `positionnement` (2 lignes), `pays`

**Filtres :** `pays`, `cible_age`.

**Drawer détail :**
- Tous les champs en plein
- `avatar_cible`
- `ce_quon_emprunte` (encadré `success-soft`)
- `ce_quon_evite` (encadré `danger-soft`)

### 3. Tendances (table `Tendances`)
**Affichage :** **timeline verticale chronologique**, triée par `pic_attendu_date` croissant.
**Item :**
```
●─── [J-2 prochain]
│    ┌──────────────────────────────────┐
│    │ Vague : Back to school sceptique │
│    │ Description...                   │
│    │ Source : ...                     │
│    │ Priorité : ★★★★☆                 │
│    └──────────────────────────────────┘
```

**Filtres :** `priorite` (range).

**Drawer détail :**
- Tous les champs
- `contenu_wubo_recommande` (encadré `accent-soft`)

## Données utilisées

| Table | Lecture | Écriture |
|---|---|---|
| Videos_virales | ✓ | — |
| Concurrents | ✓ | — |
| Tendances | ✓ | — |

Aucune écriture. Strictement read-only.

## Hooks shared utilisés
- `useVideosVirales`, `useConcurrents`, `useTendances`

## Composants à créer dans `src/views/veille/components/`

- `VeilleShell.tsx` (3 tabs)
- `VideoViraleCard.tsx`, `VideoViraleDrawer.tsx`
- `ConcurrentCard.tsx`, `ConcurrentDrawer.tsx`
- `TendanceTimeline.tsx`, `TendanceTimelineItem.tsx`, `TendanceDrawer.tsx`
- `VeilleFilterBar.tsx`

## États
- **Loading** : skeleton 6 cards (ou 6 items timeline).
- **Empty data** : "Aucune entrée. Ajoute via Grist."
- **Erreur** : toast + bouton Reset clé API global.

## Hors-scope V1
- Création / édition.
- Scraping automatique.
- Lien direct vidéo virale → reel pré-rempli (V2).
- Embed des vidéos.
- Notes personnelles sur une entrée (V2).

## Definition of Done

Boki doit pouvoir :
- [ ] 3 tabs avec compteurs.
- [ ] Switch de tab change l'affichage.
- [ ] Filtres fonctionnels par tab.
- [ ] Click card / item → Drawer détail.
- [ ] Liens externes ouvrent en nouveau tab (`target="_blank" rel="noopener"`).
- [ ] Timeline Tendances ordonnée chronologiquement.
- [ ] Tier S/A/B/C bien colorés.
- [ ] Aucune erreur console.
- [ ] Captures d'écran dans `docs/screenshots/veille/` :
  - tab-videos.png, tab-concurrents.png, tab-tendances-timeline.png, drawer-video-detail.png, empty-state.png

## Découpage suggéré

Vue la plus simple. Idéale pour un agent solo full-stack.
Time-box V1 : 1 jour full-stack.
