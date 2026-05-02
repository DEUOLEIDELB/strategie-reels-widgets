# Vue 02 : BIBLIOTHÈQUE — Studio Wubo (V2)

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

## Pivot V1.1 → V2 (mai 2026)

La V1.1 reproduisait dans la Bibliothèque l'injection de Hooks/Scripts qui se fait déjà dans la sidebar Atelier. **Doublon supprimé.** La Bibliothèque devient le **Studio de production** : tout ce qu'il faut **après** l'Atelier pour passer du Reel composé au Reel publié.

Découpage cognitif :
- **Atelier** : qu'est-ce que je raconte ? (canvas combinatoire avec sidebar de briques narratives)
- **Bibliothèque (Studio)** : avec quoi je le produis ? (matos, sons, outils, savoir-faire)
- **Veille** : qu'est-ce qui marche ailleurs ?

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  STUDIO DASHBOARD (mini, lu en 5s)                                │
│  • X Reels en attente de tournage                                 │
│  • Y sessions à planifier                                         │
│  • Z brolls jamais réutilisés                                     │
│  + alertes contextuelles si manques                               │
├──────────────────────────────────────────────────────────────────┤
│ [ Plateau Wubo ]  [ Stock externe ]  [ Manuel Wubo ]              │
├──────────────────────────────────────────────────────────────────┤
│ Contenu de la section active                                      │
└──────────────────────────────────────────────────────────────────┘
```

## Section 1 : Plateau Wubo (notre matos)

3 sub-tabs.

### B-rolls (table Grist `Broll`)
Banque interne de plans réutilisables. Card par broll :
- Code (B17, B23...)
- Description plan, setup technique
- Durée, priorité, statut (à tourner / tourné / monté)
- Compteur de Reels qui l'utilisent + flag "jamais utilisé" en warning

**Filtre clé** : "Uniquement les orphelins (jamais réutilisés)" pour rentabiliser ce qui dort.

### Sessions de tournage (table `Sessions_tournage`)
Planning prod. Card par session :
- Type, date, lieu
- Durée estimée, équipement, personnes requises
- Compteur de Reels alimentés

### Setups (4 statiques en code)
Catalogue des configurations récurrentes : face cam Taki, table sombre + LED, atelier enfants, B-roll libre. Avec checklist équipement par setup. Source : `lib/setups.ts`.

## Section 2 : Stock externe (matos emprunté)

3 sub-tabs basés sur le champ Grist `type_action` :
- **Banques** (Pexels, Pixabay, Mixkit, Freesound, etc.) : action = ouvrir le site
- **Assets directs** (recherches précises Pixabay pour SFX essentiels) : action = télécharger
- **Outils logiciels** (CapCut, Canva, Photopea...) : action = lancer

**Filtre droits** en barre : `public_domain` + `cc` + `free` + `freemium` actifs par défaut, `payant` masqué (cliquable si on veut le voir).

**Click sur card = action directe** (`window.open` URL nouvel onglet). Pas de drawer pour les ressources : l'utilisateur veut OUVRIR, pas LIRE un détail.

Tri auto par `score_priorite` descendant.

## Section 3 : Manuel Wubo (savoir-faire condensé)

4 blocs en grille, lus en 30s pendant la prod.

### Identité visuelle
Palette Wubo (6 couleurs avec hex et usage), polices recommandées (Anton, Inter), formats d'export (1080×1920 30fps H.265), 6 règles d'overlay clés. Source : `lib/identite.ts`.

### Checklists
Pré-tournage (8 items) et post-tournage / montage (10 items). Items courts avec détails optionnels. Source : `lib/checklists.ts`.

### Cheat sheet hooks
12 types de hooks avec un exemple Wubo chacun. Compressé. Source : `lib/cheatSheet.ts`.

### Cheat sheet formats
9 formats vidéo en 1 ligne chacun. Compressé. Même source.

## Données utilisées

| Table | Lecture | Écriture |
|---|---|---|
| Broll | ✓ | — |
| Sessions_tournage | ✓ | — |
| Ressources (avec colonnes ajoutées : `type_action`, `droits`, `archive`) | ✓ | — |
| Reels (pour le dashboard count statut) | ✓ | — |

## Schéma Grist : delta appliqué en mai 2026

Trois colonnes ajoutées sur la table `Ressources` :

| Col | Type | Choices | Notes |
|---|---|---|---|
| `type_action` | Choice | `banque` / `asset_direct` / `outil_logiciel` | Détermine sub-tab Stock externe et icône d'action |
| `droits` | Choice | `public_domain` / `cc` / `free` / `freemium` / `payant` | Filtre droits, payant masqué par défaut |
| `archive` | Bool | — | Si true, masquée par défaut (blogs trending sounds, ressources obsolètes) |

Nettoyage data : 7 lignes archivées (6 blogs trending + Animaker score 1), 44 lignes re-taggées, 3 ajouts (Bensound, Google Fonts, Photopea).

## Hooks shared utilisés

- `useBroll`, `useSessions`, `useRessources`, `useReels`
- Pas de mutations en V2.

## Composants `src/views/bibliotheque/`

```
src/views/bibliotheque/
├── index.tsx                   # shell + nav 3 sections
├── components/
│   ├── StudioDashboard.tsx     # mini dashboard top
│   ├── PlateauWubo.tsx         # section 1 (3 sub-tabs)
│   ├── StockExterne.tsx        # section 2 (3 sub-tabs + filtre droits)
│   ├── ManuelWubo.tsx          # section 3 (4 blocs)
│   ├── BrollCard.tsx
│   ├── SessionCard.tsx
│   ├── SetupCard.tsx
│   └── RessourceRow.tsx        # ligne dense, action directe
├── lib/
│   ├── setups.ts               # 4 setups statiques
│   ├── checklists.ts           # pré + post tournage
│   ├── identite.ts             # palette + fonts + ratios + règles overlay
│   ├── cheatSheet.ts           # 12 hooks + 9 formats compressés
│   └── dashboard.ts            # snapshot cross-tables
└── types.ts                    # Section, RessourceWithAction, etc.
```

## États

- **Loading** : skeletons par section (6 cards Brolls, 4 Sessions, 8 lignes Stock).
- **Empty B-rolls** : EmptyState invitant à ajouter via Grist.
- **Empty Sessions** : EmptyState invitant à planifier le prochain batch.
- **Empty Stock** : EmptyState filtres trop restrictifs.

## Hors-scope V2

- Édition de briques depuis cette vue (les Brolls et Sessions s'éditent dans Grist).
- Métriques de Reel publié (futur dashboard ou vue dédiée).
- Templates de captions/hashtags (pourra rejoindre le Manuel en V2.5).
- Notification quand un broll devient orphelin (V3).

## Definition of Done

Boki doit pouvoir :
- [ ] Voir le mini dashboard en haut, avec compteurs et alertes contextuelles.
- [ ] Naviguer entre les 3 sections (Plateau / Stock / Manuel).
- [ ] **Plateau** : voir ses Brolls, filtrer "orphelins uniquement", voir ses Sessions, voir les 4 setups.
- [ ] **Stock** : voir Banques / Assets / Outils, filtrer par droits, click ressource = ouverture URL nouvel onglet.
- [ ] **Manuel** : consulter la palette, les fonts, les checklists, les cheat sheets en une seule vue.
- [ ] Aucune erreur console.
- [ ] Captures d'écran dans `docs/screenshots/bibliotheque/` (à fournir).
