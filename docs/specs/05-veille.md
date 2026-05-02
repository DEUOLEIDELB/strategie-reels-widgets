# Vue 03 : VEILLE (V3, refonte visual-first 2026-05-02)

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

> **Versioning** : la V1 (read-only browser de tables) est dans l'historique git. La V2 (dashboard de synthèse + 5 radars text-heavy) a été shippée puis recallée le jour même : trop de formulaires, pas assez de visuels. La V3 ci-dessous reprend l'idée Signal/Insight/Action de la V2 mais réorganise tout par **6 blocs (features)**, avec **Pulse Concurrents** (feed visuel des Reels concurrents) comme bloc central. Layout sidebar gauche, contenu plein écran à droite.

## Architecture V3 : 6 blocs (sidebar gauche)

```
VEILLE
├─ 🔥 Pulse Concurrents     ← le coeur, 80% du temps. Feed des Reels.
├─ 📊 Pulse Wubo            ← tes performances (placeholder V1)
├─ 🌊 Vagues & Sons         ← tendances externes (placeholder V1)
├─ 🏆 Hall of Fame          ← vidéos virales hors-concurrents (placeholder V1)
├─ 🎯 Réseau                ← influenceurs Tier 1-4 (placeholder V1)
└─ 📋 Synthèse hebdo        ← le livrable composé (placeholder V1)
```

**V1 livre uniquement Pulse Concurrents en visuel complet** + capture signal partagée (héritée V2). Les 5 autres blocs sont des `BlocPlaceholder.tsx` qui décrivent ce qui viendra (intent + features). Ils seront codés au fil des itérations une fois le pattern Pulse Concurrents validé.

## Bloc 1 : Pulse Concurrents (V1 complet)

### Modèle de données

Nouvelle table Grist `Posts_concurrents` (créée 2026-05-02, voir `00-grist-delta.md`).

| Col | Type | Notes |
|---|---|---|
| `concurrent` | Ref:Concurrents | obligatoire |
| `url_post` | Text | URL Instagram/TikTok/YouTube |
| `plateforme` | Choice | `instagram` / `tiktok` / `youtube` |
| `date_post` | Date | |
| `thumbnail_url` | Text | URL image. À défaut placeholder neutre. |
| `caption` | Text | facultatif |
| `vues` | Numeric | |
| `likes` | Numeric | |
| `comments` | Numeric | |
| `format_detecte` | Choice | `face_cam` / `b_roll` / `split_screen` / `talking_head` / `ugc` / `tutorial` / `reaction` / `compilation` / `autre` |
| `score_viralite` | Numeric | calcul : vues / médiane_compte. ≥2 = viral |
| `captured_signal` | Ref:Signaux_veille | si capturé |
| `notes` | Text | |

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔥 Pulse Concurrents              [+ Ajouter un post]            │
│ N posts feed, M affichés                                         │
├──────────────────────────────────────────────────────────────────┤
│ [Filter] [Tous concurrents▼] [Toutes plateformes▼] [30 jours▼]  │
│         [Tous formats▼] [Tout / Viraux▼]                  Reset │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ 9:16   │ │ 9:16   │ │ 9:16   │ │ 9:16   │ │ 9:16   │  ← grid  │
│ │ thumb  │ │ thumb  │ │ thumb  │ │ thumb  │ │ thumb  │  responsive│
│ │ 220K🔥 │ │ 184K   │ │ 18K    │ │ 95K    │ │ 250K🔥 │  2 → 5 cols│
│ │ ⓘkiwi  │ │ ⓘcirc  │ │ ⓘpand  │ │ ⓘmel   │ │ ⓘelec  │           │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│ ...                                                              │
└──────────────────────────────────────────────────────────────────┘

Click thumbnail → Drawer 480px droite avec:
- Hero thumbnail aspect 9:16
- Score viralité badge
- Stats grid 3 cols (vues / likes / comments)
- Meta grid (date / plateforme / format / engagement rate)
- Caption si présente
- Bouton "Capturer comme signal" (pré-rempli concurrent_lie)
- Bouton "Créer Reel Wubo inspiré" (crée concept + setView atelier)
- Bouton suppression (icon)
```

### Composants V1

`src/views/veille/blocs/PulseConcurrents/`
- `index.tsx` : feed + filtres + EmptyStates
- `ConcurrentPostCard.tsx` : card visuelle 9:16 avec gradients overlay, hover capturer
- `ConcurrentPostDrawer.tsx` : drawer détail
- `AjouterPostModal.tsx` : modale ajout (URL + auto-detect plateforme + concurrent + thumbnail + métriques)

### Décisions UX clés

- **Aucune card sans visuel dominant** : thumbnail 9:16 prend ~70% de la card, texte = 30% en bas. Pas de pavé positionnement.
- **Hover-only actions** : le bouton `+ Capturer` n'apparaît qu'au hover de la card (réduit le bruit visuel).
- **Score viralité visualisé** : barre de progression colorée (vert/jaune/rouge) + badge `🔥 viral` si ≥2.
- **Auto-detect plateforme** dans la modale ajout : on parse l'URL (`instagram.com` → instagram, etc.).
- **Avatar concurrent en initiales** par défaut (2 lettres dans cercle current-soft) tant qu'on n'a pas de photo de profil scrappée.

### Roadmap d'enrichissement

- V1.5 : microservice oEmbed/scraping sur VPS qui auto-fill thumbnail + métriques quand on colle l'URL
- V2 : workflow n8n hebdo qui scrappe les comptes concurrents et ajoute les nouveaux Reels en table
- V2 : score_viralite calculé auto (médiane glissante 30 derniers posts du compte)
- V2 : page profil concurrent avec courbe followers + grille tous ses Reels

## Blocs 2-6 (placeholders V1)

Chaque bloc a son fichier `index.tsx` qui rend `BlocPlaceholder` (titre + intent + liste features prévues). Le composant est dans `src/views/veille/blocs/BlocPlaceholder.tsx`. Voir le code pour la liste exacte des features par bloc.

## Capture signal (réutilisée de V2)

`CapturerSignalModal` reste utilisée : elle s'ouvre depuis l'overlay `+` sur une card Pulse, avec contexte pré-rempli (`titre`, `source_url`, `categorie: 'concurrent'`, `concurrent_lie`). Validation conditionnelle : `insight` requis si `horizon = now`.

## Hooks shared utilisés (V3)

Nouveaux (V3) : `usePostsConcurrents`, `useCreatePostConcurrent`, `useUpdatePostConcurrent`, `useDeletePostConcurrent`.

Existants (V2 réutilisés) : `useConcurrents`, `useInfluenceurs`, `useTendances`, `useVideosVirales`, `useMetriquesReels`, `useReels`, `useCreateReel`, `useSignauxVeille`, `useCreateSignalVeille`, `useUpdateSynthese`, etc.

Store local Veille : `src/views/veille/store.ts` (Zustand) avec `bloc: BlocVeille` et `setBloc`.

## Definition of Done V1 (livré 2026-05-02)

- [x] Sidebar 6 blocs avec compteur "nouveaux posts 7j" sur Pulse Concurrents
- [x] Bloc Pulse Concurrents fonctionnel : feed grille responsive, filtres 5 axes, drawer détail, modale ajout, suppression
- [x] Cards visuelles 9:16 avec thumbnail dominant + gradients overlay
- [x] Auto-detect plateforme depuis URL dans modale ajout
- [x] Score viralité visualisé (barre + badge 🔥)
- [x] Bouton "Créer Reel inspiré" qui transforme un post concurrent en Reel concept Wubo
- [x] 5 placeholders explicites pour les autres blocs (`BlocPlaceholder`)
- [x] 15 posts démo injectés dans Posts_concurrents pour valider le visuel
- [x] Capture signal V2 réutilisée et reliée aux posts concurrents
- [x] Build passe, TypeScript strict OK

## Hors-scope V1 (V2+)

- 5 blocs autres (Pulse Wubo, Vagues & Sons, Hall of Fame, Réseau, Synthèse hebdo) en visuel complet
- Microservice oEmbed pour auto-fill thumbnail/métriques
- Scraping auto via n8n + Apify
- Calcul auto du score_viralite
- Page profil concurrent avec courbe followers
- Bookmarklet (V2 future)

---

## Annexes : artefacts V2 conservés

Les composants suivants de la V2 restent dans le code et sont réutilisés en V3 :
- `CapturerSignalModal` (modale capture signal, héritée)
- `CategorieBadge`, `HorizonBadge` (atomes visuels)
- `EditableField`, `SyntheseSection` (réservés au futur Bloc 6 Synthèse)

Le reste de la V2 (`SyntheseHebdo` view monolithique, `RadarTabs` et 5 radars) a été supprimé. La logique d'auto-création de la synthèse hebdo et d'archivage est différée au futur Bloc 6.

## Objectif

Transformer un flux de signaux externes en **interprétation actionnable**.

La Veille est le seul endroit où l'on consomme une synthèse digérée : pas un catalogue à scroller, mais un livrable hebdo de 1 page que Boki lit dimanche matin avant le batch tournage. La synthèse est **alimentée toute la semaine** par capture rapide, **archivée le dimanche** comme snapshot historique, et **génère 3 actions concrètes** pour la semaine suivante.

Principe directeur : **Signal → Insight → Action**. Aucune entrée n'existe sans interprétation. Aucune synthèse ne se clôt sans 3 actions.

## Architecture en 2 zones

```
┌────────────────────────────────────────────────────────────────────┐
│ VEILLE                                                             │
│ Semaine 19 (5 → 11 mai)        [Archiver synthèse] [+ Capturer]    │
├────────────────────────────────────────────────────────────────────┤
│ ZONE 1 : SYNTHÈSE HEBDO (1 page, 5 sections, éditable inline)      │
│                                                                    │
│ ┌────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ 📊 PERFORMANCE             │ │ 🎯 CONCURRENTS (3 lignes)       │ │
│ │ Top : ...                  │ │ - KiwiCo a testé X → 220K vues  │ │
│ │ Flop : ...                 │ │ - CrunchLabs a posté Y → flop   │ │
│ │ À surveiller : ...         │ │ - MonElectroBox a relancé série │ │
│ └────────────────────────────┘ └─────────────────────────────────┘ │
│                                                                    │
│ ┌────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ 🔥 TRENDS À EXPLOITER NOW  │ │ 🔮 SIGNAUX FAIBLES (next/later) │ │
│ │ Son X (12k uses, +340%)    │ │ - À confirmer : ...             │ │
│ │ Format Y                   │ │ - Pattern émergent : ...        │ │
│ └────────────────────────────┘ └─────────────────────────────────┘ │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ✅ 3 ACTIONS SEMAINE PROCHAINE                                 │ │
│ │ 1. Tourner Reel sur son X avant jeudi  → [Créer Reel]          │ │
│ │ 2. Tester format Y inspiré KiwiCo      → [Créer Reel]          │ │
│ │ 3. Répondre vague DM sujet écrans      → [Créer note]          │ │
│ └────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│ ZONE 2 : RADARS (sources de capture, 5 tabs)                       │
│                                                                    │
│ [Performance] [Concurrents] [Inspiration] [Tendances] [Audience]   │
│ ────────────────────────────────────────────────────────────────── │
│ 🔎 Filtres contextuels par tab                                     │
│ ────────────────────────────────────────────────────────────────── │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                                    │
│ │card │ │card │ │card │ │card │  → Click = Drawer + bouton         │
│ └─────┘ └─────┘ └─────┘ └─────┘     "Capturer signal"              │
└────────────────────────────────────────────────────────────────────┘
```

**Zone 1 = ce que tu CONSOMMES.** Toujours visible en haut. Une seule synthèse "en cours" à la fois (la semaine ISO courante).

**Zone 2 = ce que tu CAPTURES.** 5 radars filtrables. Chaque item peut devenir un signal en 1 clic.

## Modèle de données

### Tables Grist existantes (lecture seule depuis cette vue)

| Table | Usage |
|---|---|
| `Concurrents` | Radar Concurrents : 9 entrées actuelles |
| `Videos_virales` | Radar Inspiration : 20 vidéos référence |
| `Tendances` | Radar Tendances : vagues 2026 |
| `Influenceurs` | Radar Audience : 32+ comptes Tier 1-4 |
| `Metriques_reels` | Radar Performance : métriques Reels Wubo postés |
| `Reels` | Lecture (lier signal → reel généré), écriture (création depuis action) |

### Nouvelles tables Grist à créer

#### Table `Signaux_veille` (capture continue)

| Col | Type | Notes |
|---|---|---|
| `id` | Auto | clé primaire |
| `date_capture` | Date | auto à la création |
| `semaine_iso` | Text | format `2026-W19`, calculé à la création |
| `source_type` | Choice | `reel` / `article` / `tweet` / `dashboard_perf` / `manuel` / `email` / `bookmarklet` |
| `source_url` | Text | URL d'origine si applicable |
| `categorie` | Choice | `performance` / `concurrent` / `trend_son` / `trend_format` / `actu` / `audience` / `algo` |
| `titre` | Text | une ligne, ce qu'on a vu |
| `signal` | Text | description courte du fait observé (ce qui a changé) |
| `insight` | Text | interprétation : pourquoi c'est important pour Wubo |
| `action_proposee` | Text | ce qu'on en fait concrètement (peut être vide initialement) |
| `horizon` | Choice | `now` / `next` / `later` |
| `statut` | Choice | `capturé` / `intégré_synthèse` / `archivé` / `ignoré` |
| `reel_genere` | Ref:Reels | si l'action a déclenché un Reel, lien direct |
| `concurrent_lie` | Ref:Concurrents | nullable, si signal vient d'un concurrent |
| `influenceur_lie` | Ref:Influenceurs | nullable |
| `notes` | Text | libre |

**Règle invariant** : un signal ne peut passer à `intégré_synthèse` que si `insight` est rempli. Pas de signal "brut" dans la synthèse.

#### Table `Synthese_hebdo` (livrable archivé)

| Col | Type | Notes |
|---|---|---|
| `id` | Auto | |
| `semaine_iso` | Text | unique, `2026-W19` |
| `date_creation` | Date | auto |
| `date_archivage` | Date | nullable, rempli au moment du snapshot |
| `performance_top` | Text | meilleur Reel + pourquoi |
| `performance_flop` | Text | pire + hypothèse |
| `performance_metrique_surveiller` | Text | watch time / sends / saves |
| `concurrents_obs` | Text | 3 lignes max, format markdown |
| `trends_now` | Text | 3-5 items à exploiter cette semaine |
| `signaux_faibles` | Text | next + later groupés |
| `actions_1` | Text | action 1 + deadline |
| `actions_2` | Text | action 2 + deadline |
| `actions_3` | Text | action 3 + deadline |
| `notes_libres` | Text | |
| `statut` | Choice | `en_cours` / `archivée` |

**Règle invariant** : il existe toujours **0 ou 1** synthèse `en_cours` (la semaine courante). Les autres sont `archivée`.

### Hooks Grist à ajouter dans `shared/` (PO uniquement)

À ajouter par le PO dans `src/shared/hooks/grist/` au moment du dispatch :

- `useSignauxVeille(filters?: { semaine?: string; horizon?: Horizon; categorie?: string; statut?: Statut })`
- `useCreateSignalVeille()`, `useUpdateSignalVeille()`, `useDeleteSignalVeille()`
- `useSyntheseEnCours()` : renvoie 0 ou 1 ligne `Synthese_hebdo` avec statut `en_cours`
- `useSynthesesArchivees()` : historique
- `useCreateSynthese()` (à l'init de semaine), `useUpdateSynthese()`, `useArchiverSynthese(id)` (mute statut + remplit `date_archivage`)
- `useMetriquesReels()` (lecture, déjà disponible si pas créé)

Existants déjà fournis (non touchés) : `useConcurrents`, `useVideosVirales`, `useTendances`, `useInfluenceurs`.

## Synthèse hebdo : 5 sections détaillées

Chaque section est **toujours éditable** (textarea ou input rendu directement, pas de toggle vue/édition). Autosave via debounce 500ms après la dernière frappe `onChange` ; persiste via `useUpdateSynthese`. Pas de bouton Save explicite. Toast discret en bas à droite ("Synthèse enregistrée") visible 1.5s à chaque save réussi.

### Section 1 : Performance Wubo (3 sous-champs)
- **Top semaine** : meilleur Reel (titre + métrique principale + pourquoi). Champ `performance_top`.
- **Flop** : pire Reel + hypothèse de cause. Champ `performance_flop`.
- **Métrique à surveiller** : watch time / saves / sends / completion. Champ `performance_metrique_surveiller`.

Aide visuelle : à droite de la section, **mini-graph** des 7 derniers Reels (vues), tiré de `Metriques_reels`. Pas interactif en V1, juste contextuel.

### Section 2 : Concurrents (1 textarea, 3 lignes max)
Format markdown libre. Suggestion de syntaxe :
```
- [@kiwico] format X testé → 220K vues → angle Wubo : ...
- [@crunchlabs] post Y → flop → ne pas reproduire
- [@monelectrobox] série relancée → opportunité collab
```

Au-dessus du textarea : **3 derniers signaux capturés** de catégorie `concurrent` cette semaine, en chips cliquables qui injectent leur `signal + insight` dans le textarea (concat).

### Section 3 : Trends Now (1 textarea)
3-5 items à exploiter **cette semaine** (window 7-14j). Format :
```
- Son [titre] (12k uses, +340%) → angle Wubo possible : ...
- Format [description] → adaptable en : ...
```
Auto-suggestion : signaux capturés cette semaine avec `horizon = now` et `categorie ∈ {trend_son, trend_format, actu}`.

### Section 4 : Signaux faibles (1 textarea)
Patterns émergents non confirmés (`next`/`later`). À confirmer dans 2-4 semaines ou simplement à surveiller.

### Section 5 : 3 actions semaine prochaine
3 champs distincts (`actions_1`, `actions_2`, `actions_3`), structure libre mais format suggéré : `<action> avant <deadline>`. À côté de chaque action :
- Bouton **[→ Créer Reel]** : ouvre modale rapide qui crée un Reel `concept` avec l'action en `titre` + `objectif`. Au save, le Signal correspondant (s'il existe) reçoit la Ref `reel_genere`.
- Bouton **[→ Capturer en signal]** : si l'action mérite suivi mais n'est pas un Reel.

## Bouton "Capturer signal"

Disponible :
- En header global de la Veille (capture libre, sans contexte source)
- Sur chaque card des 5 radars (capture avec source pré-remplie)
- Via bookmarklet (hors UI, voir Roadmap ingestion)

Modale `CapturerSignalModal` :
```
┌─────────────────────────────────────────────────┐
│ Capturer un signal                              │
├─────────────────────────────────────────────────┤
│ Catégorie     : [Concurrent ▼]                  │
│ Titre         : [........................]      │
│ Source URL    : [........................]      │
│ Signal        : [textarea, 2 lignes]            │
│   Ce qui a changé / ce que tu as vu             │
│ Insight       : [textarea, 2 lignes]            │
│   Pourquoi c'est important pour Wubo            │
│ Action        : [textarea, 1 ligne]             │
│   Optionnel : peut rester vide                  │
│ Horizon       : ◉ Now  ○ Next  ○ Later          │
├─────────────────────────────────────────────────┤
│              [Annuler]  [Capturer]              │
└─────────────────────────────────────────────────┘
```

**Validation** : `categorie` + `titre` + `signal` requis. `insight` requis seulement si `horizon = now` (le user doit avoir une raison de l'exploiter cette semaine). `action_proposee` optionnel.

Sur capture réussie : toast vert + petit pulse sur la section concernée de la synthèse hebdo (visuel : 250ms d'accent-soft) pour rappeler que la synthèse a un nouveau signal disponible.

## Radars (Zone 2)

5 tabs, layout commun : **filter bar en haut** (filtres contextuels au radar) + **grid de cards** + **drawer détail** au click.

### Radar 1 : Performance
**Source** : `Metriques_reels` (joint avec `Reels`).
**Card** : titre Reel, vues, ratio saves/vues, ratio sends/vues, badge statut, date post.
**Filtres** : semaine, statut, signal_algo.
**Drawer** : métriques complètes + liens "voir Reel dans Atelier" + bouton Capturer signal pré-rempli avec contexte (catégorie `performance`).

**Décision-rule visuelle** : Reels avec `vues < 200 après 48h` → badge `danger-soft` ("changer le hook, pas le sujet"). Issu de la bible production.

### Radar 2 : Concurrents
**Source** : `Concurrents`.
**Card** : nom, username (lien IG), followers IG/TikTok (badges), prix, cible_age, preview positionnement, pays.
**Filtres** : `pays`, `cible_age`.
**Drawer** : tous les champs + `ce_quon_emprunte` (`success-soft`) + `ce_quon_evite` (`danger-soft`) + **historique des signaux capturés sur ce concurrent** (les 5 derniers via `concurrent_lie`).

### Radar 3 : Inspiration (Vidéos virales)
**Source** : `Videos_virales`.
**Card** : thumbnail (placeholder neutre si vide), créateur, titre 2 lignes, vues_likes, plateforme (icon), badge `categorie_pain_point`, badge S/A/B/C tier (S=`current`, A=`success`, B=`warning`, C=`text-muted`).
**Filtres** : `plateforme`, `tier_reproductibilite` (multi), `categorie_pain_point`.
**Drawer** : tous les champs + `pourquoi_a_perce` + `hook_pour_wubo` (`accent-soft`) + chips `signal_algo` + lien externe.

### Radar 4 : Tendances
**Source** : `Tendances`.
**Affichage** : timeline verticale chronologique (triée par `pic_attendu_date` croissant). Item simple :
```
●─── J-2 prochain
│    [Vague : Back to school sceptique]
│    Description...
│    Source : ... | Priorité : ★★★★☆
```
**Filtres** : range `priorite`.
**Drawer** : tous les champs + `contenu_wubo_recommande` (`accent-soft`).

### Radar 5 : Audience
**Source** : `Influenceurs` (32 comptes Tier 1-4).
**Card** : username (lien IG), followers, badge `categorie`, badge `tier_contact` (1=current, 2=info, 3=warning, 4=text-muted), badge `statut_contact` (à_contacter / contacté / partenaire), preview `pourquoi`.
**Filtres** : `categorie`, `tier_contact`, `cercle_influence`, `statut_contact`.
**Drawer** : tous les champs + `notes` éditables (mutation `useUpdateInfluenceur` : lecture seule en V1, édition en V2 future) + bouton Capturer signal pré-rempli (catégorie `audience`, `influenceur_lie` rempli).

**Pas d'édition en V1** : modifs influenceurs passent par Grist directement. Bouton "Ouvrir dans Grist" suffit.

## Mécanique d'archivage hebdo

### Cycle d'une synthèse

```
┌──────────────────────┐                  ┌──────────────────────┐
│ Semaine W19 commence │                  │ Semaine W20 commence │
│ Lundi 5 mai          │                  │ Lundi 12 mai         │
└──────────┬───────────┘                  └──────────┬───────────┘
           │                                         │
           ↓                                         ↓
  ┌────────────────────┐                  ┌────────────────────┐
  │ Synthese_hebdo     │                  │ Synthese_hebdo     │
  │ semaine_iso = W19  │   ←── archivage  │ semaine_iso = W20  │
  │ statut = en_cours  │   dimanche 11    │ statut = en_cours  │
  └────────────────────┘                  └────────────────────┘
           │
           ↓
  ┌────────────────────┐
  │ Bouton             │
  │ [Archiver synthèse]│
  │ ── Confirme ──     │
  │ statut = archivée  │
  │ + crée W20 vide    │
  └────────────────────┘
```

**Bouton "Archiver synthèse"** (header, à droite) :
- Disponible uniquement si une synthèse `en_cours` existe pour la semaine ISO courante.
- Au clic : `ConfirmDialog` ("Archiver la synthèse W19 ? Une nouvelle vide sera créée pour W20.").
- Sur confirmation :
  1. `useUpdateSynthese` : statut → `archivée`, `date_archivage` = today
  2. Tous les signaux `intégré_synthèse` de cette semaine passent à `archivé`
  3. `useCreateSynthese` : nouvelle ligne avec `semaine_iso` = semaine prochaine, statut `en_cours`, tous champs vides
  4. Toast succès + auto-scroll en haut sur la nouvelle synthèse vide

### Auto-création de la synthèse de la semaine

Au mount de la Veille : si `useSyntheseEnCours()` renvoie 0 ligne, créer auto une synthèse `en_cours` pour la semaine ISO courante. C'est le seul cas d'écriture automatique sans action user.

## Decision rules (visualisées dans l'UI)

| Si | Alors |
|---|---|
| Signal capturé sans `insight` ET `horizon = now` | Bouton "Capturer" disabled, message "Now exige un insight" |
| Reel Wubo `< 200 vues à 48h` | Badge `danger-soft` "changer le hook" sur le radar Performance |
| Concurrent (Tier1) post `> 2× sa moyenne` (V2) | Highlight automatique dans radar Concurrents (badge `accent-soft`) |
| Tendance avec `pic_attendu_date < +14j` | Highlight `warning-soft` dans timeline + suggestion auto-injection en Trends Now |
| Synthèse hebdo : 0 actions remplies au dimanche | Bouton archivage disabled, message "Remplis 3 actions avant d'archiver" |
| Signal `intégré_synthèse` puis on supprime du textarea | Re-passe à `capturé` (pas perdu) |

## Hooks shared utilisés

**Lecture seule** :
- `useConcurrents`, `useVideosVirales`, `useTendances`, `useInfluenceurs`
- `useMetriquesReels`, `useReels`
- `useSignauxVeille`, `useSyntheseEnCours`, `useSynthesesArchivees`

**Écriture** :
- `useCreateSignalVeille`, `useUpdateSignalVeille`, `useDeleteSignalVeille`
- `useCreateSynthese`, `useUpdateSynthese`, `useArchiverSynthese`
- `useCreateReel` (pour bouton "→ Créer Reel" depuis actions)

**Store** :
- `setView` (pour navigation vers Atelier après création Reel)
- `setCurrentBrique` (pour pré-sélectionner le Reel créé dans Atelier)

## Composants à créer dans `src/views/veille/components/`

### Layout
- `VeilleShell.tsx` : layout 2 zones, gère semaine ISO courante, mount auto-creation synthèse
- `VeilleHeader.tsx` : titre + semaine + boutons globaux (Archiver, Capturer)

### Zone 1 : Synthèse
- `SyntheseHebdo.tsx` : container 5 sections
- `SectionPerformance.tsx` : 3 sous-champs + mini-graph
- `SectionConcurrents.tsx` : textarea + chips signaux de la semaine
- `SectionTrendsNow.tsx` : textarea + auto-suggestions
- `SectionSignauxFaibles.tsx` : textarea
- `SectionActions.tsx` : 3 champs + boutons "→ Créer Reel" / "→ Capturer"
- `EditableField.tsx` : atome wrapper autour d'un Textarea/Input shared, ajoute la logique d'autosave debounce 500ms via `useUpdateSynthese`
- `MiniGraphReels.tsx` : graph SVG simple, pas de lib externe

### Zone 2 : Radars
- `RadarTabs.tsx` : switcher 5 tabs
- `RadarPerformance.tsx`, `RadarConcurrents.tsx`, `RadarInspiration.tsx`, `RadarTendances.tsx`, `RadarAudience.tsx`
- `RadarFilterBar.tsx` : filtres contextuels selon tab
- `ItemCard.tsx` : card générique paramétrable
- `ItemDrawer.tsx` : drawer détail générique
- `ConcurrentSignauxList.tsx` : derniers signaux d'un concurrent (drawer Concurrents)

### Capture
- `CapturerSignalModal.tsx` : modale formulaire capture
- `HorizonBadge.tsx` : badge Now/Next/Later coloré
- `CategorieBadge.tsx` : badge catégorie

### Archivage
- `ArchiverSyntheseDialog.tsx` : ConfirmDialog avec récap

### Utilitaires
- `useCurrentSemaineIso.ts` : hook qui renvoie `2026-W19`
- `signalToReel.ts` : helper de mapping action → Reel pré-rempli

## Roadmap d'ingestion externe (documentée, hors-scope V1)

La V1 se limite à la **capture manuelle** depuis le widget. Les niveaux 2-4 sont planifiés mais pas implémentés en V1.

### Niveau 1 : Capture manuelle (V1, dans cette spec)
- Bouton "Capturer signal" dans le widget (radars + header global)
- Bookmarklet `javascript:void(window.open('https://deuoleidelb.github.io/strategie-reels-widgets/?capture=' + encodeURIComponent(location.href)))` à coller dans la barre des favoris (URL à finaliser pour ouvrir directement la modale capture pré-remplie). Documenter l'install dans `docs/bookmarklet.md`.

### Niveau 2 : Pull automatique (V1.5, n8n sur VPS Wubo)
Workflows n8n à créer plus tard :
- **Google Alerts RSS** → entrées `Signaux_veille` catégorie `actu`. Keywords : "loi écrans enfants", "smartphone interdiction école", "Jonathan Haidt français", "rapport Élysée écrans".
- **Pinterest Trends RSS** → keywords "no phone summer", "screen free activities".
- **Reddit RSS** → r/Parenting, r/screentime, r/ScreenFree.
- **Email forward → Grist** : adresse `veille@wubo.fr`, n8n parse subject + body, crée signal catégorie `manuel`.
- **YouTube Data API** : surveillance Mark Rober, MEL Science, Pandacraft (1 cron hebdo).

### Niveau 3 : Push externe payant (V2, optionnel)
- Brand24 / Mention : webhook → n8n → Grist. ~99€/mois si pertinent.
- Trendpop : trending sounds Reels, export CSV → import auto.

### Niveau 4 : Synthèse assistée par agent (V2)
Skill Claude Code `veille-synthese` qui :
1. Lit tous les `Signaux_veille` de la semaine en cours
2. Lit `Metriques_reels` des 7 derniers Reels
3. Détecte patterns (ex : ≥3 concurrents ont testé même format)
4. Pré-remplit la `Synthese_hebdo` du dimanche
5. Boki valide / corrige / archive

Cible : passer de 45 min de synthèse manuelle à 15 min de validation.

## États UX

### Loading
- Synthèse : skeleton des 5 sections.
- Radars : skeleton 6 cards.

### Empty data par radar
- Performance : "Pas de Reels postés cette semaine. Tourne ton premier."
- Concurrents : "Aucun concurrent. Ajoute via Grist."
- Inspiration : "Aucune vidéo virale. Ajoute via Grist."
- Tendances : "Aucune tendance. Ajoute via Grist."
- Audience : "Aucun influenceur. Ajoute via Grist."

### Empty signaux semaine
Sur chaque section synthèse, si 0 signal capturé : "Aucun signal cette semaine. Capture-en depuis les radars ↓"

### Erreur
Toast rouge + log console + bouton Reset clé API au niveau Shell.

## Hors-scope V1

- Création/édition Concurrents/Influenceurs/Vidéos virales/Tendances depuis le widget (passe par Grist).
- Niveaux 2-3-4 d'ingestion externe (juste documentés en roadmap).
- Embed des vidéos virales (lien externe seulement).
- Notifications push / rappels dimanche.
- Multi-utilisateur (Boki opère seul).
- Mini-graph interactif.
- Comparaison synthèses S vs S-1 (V2).
- Recherche globale signaux (V2).
- Consultation des synthèses archivées dans le widget (V2). En V1 elles existent dans Grist et sont consultables là-bas. Dans le widget, on ne voit que la synthèse `en_cours`.
- Modification rétroactive d'une synthèse archivée (`statut = archivée` est définitif côté UI).

## Definition of Done

Boki doit pouvoir :
- [ ] Au mount, voir la synthèse de la semaine ISO courante (créée auto si absente).
- [ ] Lire les 5 sections de la synthèse (Performance / Concurrents / Trends Now / Signaux faibles / 3 Actions).
- [ ] Éditer chaque section inline (autosave 500ms debounce).
- [ ] Voir les 5 radars en zone basse, switcher entre eux.
- [ ] Filtrer chaque radar via filter bar contextuelle.
- [ ] Click card → drawer détail.
- [ ] Bouton "Capturer signal" disponible : header global + chaque card radar.
- [ ] Modale Capturer fonctionne : validation `categorie` + `titre` + `signal` requis ; `insight` requis si `horizon = now`.
- [ ] Capture créé entrée `Signaux_veille` + toast + pulse section concernée.
- [ ] Sur radar Concurrents, drawer affiche les 5 derniers signaux liés au concurrent.
- [ ] Sur radar Performance, badge `danger-soft` si Reel < 200 vues à 48h.
- [ ] Bouton "→ Créer Reel" depuis section Actions ouvre modale, crée Reel statut `concept`, set `reel_genere` si signal source.
- [ ] Bouton "Archiver synthèse" : disabled si 0 actions remplies, sinon ouvre confirm, archive et crée nouvelle synthèse vide pour W+1.
- [ ] Bookmarklet documenté dans `docs/bookmarklet.md` avec URL et instructions d'install.
- [ ] Liens externes ouvrent en nouveau tab (`target="_blank" rel="noopener"`).
- [ ] Aucune erreur console en parcours nominal.
- [ ] Captures dans `docs/screenshots/veille/` :
  - `synthese-vide.png`, `synthese-remplie.png`, `radar-performance.png`, `radar-concurrents.png`, `radar-inspiration.png`, `radar-tendances.png`, `radar-audience.png`, `drawer-concurrent.png`, `capturer-modal.png`, `archiver-confirm.png`, `creer-reel-action.png`.

## Découpage suggéré

**Time-box V1 : 2.5 jours full-stack** (vs 1 jour V1 simple). Réparti :
- 0.5 j : tables Grist (PO) + hooks shared (PO)
- 1 j : Zone 1 (synthèse + sections + autosave + actions)
- 1 j : Zone 2 (5 radars + filtres + drawers + capture)
- 0.5 j : archivage + bookmarklet + captures + polish

Ou 1 j designer + 1.5 j dev en parallèle si dispo.

## Prérequis avant dispatch

Le PO doit :
1. Créer les 2 nouvelles tables Grist (`Signaux_veille`, `Synthese_hebdo`) avec colonnes ci-dessus.
2. Ajouter les hooks correspondants dans `src/shared/hooks/grist/`.
3. Mettre à jour `src/shared/lib/types.ts` avec les nouvelles interfaces TS.
4. Documenter le delta dans `00-grist-delta.md` (ajout d'une section "Delta V2 : Veille").
5. Commit "phase 0b: tables veille V2 + hooks".
6. Dispatcher l'agent Veille avec lien vers cette spec.
