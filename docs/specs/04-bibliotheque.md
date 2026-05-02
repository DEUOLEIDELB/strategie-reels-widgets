# Vue 02 : BIBLIOTHÈQUE (V1.1)

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

## Objectif

Pool de **briques réutilisables**. Boki navigue, filtre, et **injecte** un élément (Hook, Script, Ressource) dans la combinaison courante de l'Atelier.

C'est un magasin, pas un atelier. Pas d'édition complexe en V1 : les briques s'éditent dans Grist directement.

Usage type : "j'ai sélectionné une combo dans l'Atelier, je viens chercher un hook qui matche, je l'injecte → ça crée un reel pré-rempli, je retourne dans l'Atelier finaliser."

## Évolution V1 → V1.1

V1 (`04-bibliotheque.md` ancien) avait 5 tabs à plat, pas de visibilité de la combo, pas de toggle d'affichage, pas de preview d'injection. V1.1 corrige ces trous.

| # | Changement V1.1 | Pourquoi |
|---|---|---|
| 1 | **Combo bar sticky** en haut de la vue | Boki voit toujours sur quoi il va injecter. Si combo incomplète : alerte + lien vers Atelier. |
| 2 | **Hiérarchie tabs** : 3 onglets injectables (Hooks, Scripts, Ressources) + 2 onglets Référence (Formats, Taxonomie) | Sépare le magasin de l'usuel encyclopédique. |
| 3 | **Toggle Liste / Grille** persisté en localStorage | 124 hooks en grid de cards = noyé. Liste compact = scan rapide. |
| 4 | **Section "Pertinent pour ta combo"** en tête | Tri auto sur les briques dont signal_algo / pain_point matche la combo courante. |
| 5 | **Recherche globale** (cross-tab) | "téléphone" sort des Hooks ET des Scripts qui le contiennent. |
| 6 | **Mémoire de filtres par tab** (Zustand local au composant) | Filtre Hooks signal=DM, je vais sur Scripts, je reviens : filtre conservé. |
| 7 | **Preview du Reel injecté** dans le Drawer avant validation | Boki voit ce qui sera créé avant de cliquer Injecter. |
| 8 | **`potentiel` (tier1/2/3) déplacé en filtre avancé** | Subjectif et masquable, plus imposé en filtre principal. |
| 9 | **Double bouton injection** : "Injecter et aller à l'Atelier" + "Injecter et rester ici" | Pour batcher plusieurs injections. |

## Layout

Une page, sticky combo bar en haut, onglets, filtres, contenu.

```
┌──────────────────────────────────────────────────────────────────┐
│ COMBO BAR (sticky, lue depuis store)                             │
│ ● Marie + ● Mère-conseil + ● Téléphone à table   [Atelier ↗]     │
│ ou : "Combo incomplète, complète dans l'Atelier"                 │
├──────────────────────────────────────────────────────────────────┤
│ 🔎 Recherche globale...                          [Liste] [Grille]│
├──────────────────────────────────────────────────────────────────┤
│ Onglets injectables :  [Hooks 124] [Scripts 38] [Ressources 40]  │
│ Onglets référence  :   [Formats] [Taxonomie 60]                  │
├──────────────────────────────────────────────────────────────────┤
│ Filtres : [signal_algo ▼] [categorie ▼] [+ avancés] [× Reset]    │
├──────────────────────────────────────────────────────────────────┤
│ ★ Pertinent pour ta combo (3-5 items, masqué si combo vide)      │
│ ┌─────┐ ┌─────┐ ┌─────┐                                           │
│ └─────┘ └─────┘ └─────┘                                           │
├──────────────────────────────────────────────────────────────────┤
│ Tous les autres items                                            │
│ Mode Grille : grid 4 col cards                                   │
│ Mode Liste  : ligne dense, 1 par item                            │
└──────────────────────────────────────────────────────────────────┘

Drawer right au click sur card :
┌────────────────────────────┐
│ Hook : "On t'avait..."     │
│ ───                        │
│ Détail complet             │
│ catégorie / méthode / etc. │
│                            │
│ ⚡ Preview du Reel injecté │
│  Avatar : Marie            │
│  Angle  : Mère-conseil     │
│  Pain   : Téléphone        │
│  Hook   : (texte)          │
│  CTA    : (texte)          │
│  Statut : concept          │
│                            │
│ [Injecter + Atelier ↗]     │
│ [Injecter et rester]       │
└────────────────────────────┘
```

## Tabs

### 1. Hooks (table `Hooks`)

**Card grille :** `texte` (3 lignes ellipsis), badge `categorie`, chips `signal_algo_cible` (max 3), badge `serie` si présent.
**Ligne liste :** thumbnail (col 1) | texte tronqué (col 2) | catégorie (col 3) | signaux (col 4) | série (col 5).
**Filtres par défaut :** `signal_algo_cible` (multi), `categorie`.
**Filtres avancés :** `methode_ou_trigger`, `serie`, `potentiel`.
**Action injection :** crée un Reel via `useCreateReel` :
- `avatar` / `angle` / `probleme` = depuis store
- `hook_verbal` = `hook.texte`
- `titre_overlay` = `hook.thumbnail`
- `cta_texte` = `hook.cta_associe` si présent
- `signal_algo` = `hook.signal_algo_cible`
- `serie` = `hook.serie`
- `statut` = `'concept'`
- `titre` = `Hook ${hook.id}` (Boki renommera dans l'Atelier)

### 2. Scripts (table `Scripts`)

**Card grille :** `titre` en gras, `sujet`, badges `categorie` + `angle`, badge `duree_sec`.
**Ligne liste :** titre | sujet | categorie | angle | durée | signal.
**Filtres par défaut :** `categorie`, `angle`.
**Filtres avancés :** `duree_sec` (slider 0-90s), `pain_point_cible` (text contains), `source_principale`.
**Action injection :** crée un Reel pré-rempli :
- `avatar` / `angle` / `probleme` = depuis store
- `titre` = `script.titre`
- `hook_verbal` = première phrase de `script.texte_oral_complet` (split sur `.` ou `[`)
- `texte_overlay` côté Reels n'existe pas (le champ s'appelle `titre_overlay`) : on utilise `script.texte_overlay`
- `structure_body` = `script.structure_body`
- `cta_type` / `cta_texte` = depuis script
- `signal_algo` = `script.signal_algo_cible`
- `duree_sec` = `script.duree_sec`
- `statut` = `'scripté'`

### 3. Ressources (table `Ressources`)

**Card grille :** `nom`, badges `categorie` + `prix`, score étoiles `score_priorite`, preview `usage_recommande`.
**Ligne liste :** nom | categorie | prix | score | usage.
**Filtres par défaut :** `categorie`, `score_priorite` (range 1-5).
**Filtres avancés :** `prix`.
**Action injection :** la ressource n'est pas un Reel. En V1 : toast "Noté : tu peux ajouter [nom] à tes notes Reel manuellement dans l'Atelier" + copie de l'URL dans le presse-papier. Pas de mutation Grist.

### 4. Formats (statique)

Pas de table. Liste constante dans `views/bibliotheque/lib/formats.ts` :
- Duel (2 personnes)
- Monologue caméra
- Tutoriel
- Réaction
- Coulisses
- Skit / mise en scène
- Talking head + B-roll
- Trio
- Compilation rapide

**Card :** nom, description, icône Lucide. Pas d'injection. Click = ouvre Drawer en lecture.

### 5. Taxonomie (table `Taxonomie`)

**Card :** badge `type`, `nom`, preview `definition`, `exemple_wubo`.
**Filtres :** `type`.
**Action :** pas d'injection. Drawer expose `quand_utiliser`.

## Combo bar (sticky)

Lecture du store. 3 chips colorées (avatar / angle / pain) avec dot couleur via `colorFromName`.

**États :**
- **Combo complète** : `[Marie + Mère-conseil + Téléphone à table] [Modifier dans l'Atelier ↗]`
- **Combo partielle** : `[Marie + ? + ?] [Compléter dans l'Atelier ↗]` en `warning-soft`.
- **Combo vide** : `[Aucune sélection] [Aller à l'Atelier ↗]` en `danger-soft`.

Click "Modifier dans l'Atelier" = `setView('atelier')`.

## Pertinence (tri auto pour la combo)

Hooks : tri par overlap entre `hook.signal_algo_cible` et `pain.signal_algo` (futur). En V1 : si pain courant a un titre, on score les hooks par présence du `methode_ou_trigger` parmi quelques mots-clefs alignés au pain. Heuristique simple, on l'affine après usage réel.

Scripts : score plus précis car `pain_point_cible` est texte. Match par slug/contains sur le titre du pain.

Ressources : pas de pertinence par combo en V1 (sont génériques).

Section "★ Pertinent" affichée si combo complète **et** au moins 1 item passe le score min (= 1 critère matché). Sinon section masquée.

## Toggle Liste / Grille

Préférence stockée localStorage `wubo_biblio_view_mode` = `'grid' | 'list'`.

- **Grid** : `grid-cols-2` sm, `grid-cols-3` md, `grid-cols-4` lg, gap-3.
- **List** : `flex flex-col gap-1`, lignes h-12 ou h-14, dense, hoverable.

Toggle dans la barre du haut (icônes `LayoutGrid` / `LayoutList` de lucide).

## Recherche globale

Input dans le header. `useDebounce` 200ms. Filtre côté client sur le tab actif :

- Hooks : match sur `texte`, `thumbnail`, `methode_ou_trigger`.
- Scripts : match sur `titre`, `sujet`, `texte_oral_complet`.
- Ressources : match sur `nom`, `usage_recommande`.
- Formats : match sur `nom`, `description`.
- Taxonomie : match sur `nom`, `definition`, `exemple_wubo`.

Compteur dans le badge de chaque tab : `[Hooks 12 / 124]` quand recherche active.

## Filtres : mémoire par tab

Zustand local au composant Bibliothèque (pas dans le store global, ils sont éphémères). State :

```ts
type FiltersState = {
  hooks: { signal: string[]; categorie: string | null; methode: string | null; serie: string | null; potentiel: string | null };
  scripts: { categorie: string | null; angle: string | null; dureeRange: [number, number]; painContains: string };
  ressources: { categorie: string | null; scoreMin: number; prix: string | null };
  taxonomie: { type: string | null };
  search: string;
  view: 'grid' | 'list';
  showAdvanced: boolean;
};
```

Bouton **Reset** dans la filter bar : reset uniquement le tab courant + search.

## Drawer + Preview Injection

Drawer right (composant `Drawer` shared). Largeur 420px.

**Header :** type de brique + ID.
**Body :**
1. Détail complet de la brique (toutes les colonnes pertinentes).
2. **Section "Le Reel qui sera créé"** (si tab injectable et combo complète) :
   - Card pré-remplie qui mime `ReelCard` avec valeurs calculées.
   - Si combo incomplète : bandeau warning "Sélectionne avatar + angle + pain dans l'Atelier avant d'injecter".
3. Bouton primary `Injecter et aller à l'Atelier` (sauf si pas injectable / combo incomplète).
4. Bouton secondary `Injecter et rester ici` (idem condition).

**Mécanique :**
```ts
const { currentAvatarId, currentAngleId, currentPainId, setView } = useAppStore();
const { mutateAsync: createReel } = useCreateReel();

async function handleInject(navigate: boolean) {
  if (!currentAvatarId || !currentAngleId || !currentPainId) {
    toast.error('Sélectionne une combinaison complète dans l\'Atelier.');
    return;
  }
  const reelInput = mapToReelInput(brique, type, { avatar, angle, probleme });
  await createReel(reelInput);
  toast.success(`${type} injecté.`);
  if (navigate) setView('atelier');
}
```

## Données utilisées

| Table | Lecture | Écriture |
|---|---|---|
| Hooks | ✓ | — |
| Scripts | ✓ | — |
| Ressources | ✓ | — |
| Taxonomie | ✓ | — |
| Avatar | ✓ (combo bar) | — |
| Angles | ✓ (combo bar) | — |
| Pain_points | ✓ (combo bar + pertinence Scripts) | — |
| Reels | — | ✓ (création par injection) |

## Hooks shared utilisés

- `useHooks`, `useScripts`, `useRessources`, `useTaxonomie`
- `useAvatars`, `useAngles`, `usePainPoints`
- `useCreateReel`
- Store : `currentAvatarId`, `currentAngleId`, `currentPainId`, `setView`

## Composants à créer dans `src/views/bibliotheque/`

```
src/views/bibliotheque/
├── index.tsx                    # Bibliotheque : exporte le shell
├── components/
│   ├── ComboBar.tsx
│   ├── PertinentSection.tsx
│   ├── BibliothequeDrawer.tsx
│   ├── HookCard.tsx
│   ├── ScriptCard.tsx
│   ├── RessourceCard.tsx
│   ├── FormatCard.tsx
│   ├── TaxoCard.tsx
│   └── InjectionPreview.tsx
├── lib/
│   ├── parsing.ts               # parse signal_algo_cible string-JSON
│   ├── injection.ts             # mapping brique → ReelInput
│   ├── pertinence.ts            # score pour la combo
│   └── formats.ts               # liste statique
└── types.ts                     # types locaux (TabId, ViewMode, FiltersState)
```

## États

- **Loading** : skeleton 8 cards (grid) ou 12 lignes (list).
- **Empty filtres** : "Aucune brique ne matche tes filtres." + bouton Reset.
- **Empty data** : "Aucun(e) [type] importé(e). Ajoute via Grist." + lien externe.
- **Erreur Grist** : Le Shell global gère le 401, on n'a rien à faire ici.

## Hors-scope V1
- Édition / création de briques depuis cette vue.
- Tri par "popularité d'injection".
- Multi-injection (sélection multiple).
- Hook AI pour générer un nouveau Hook depuis la combo (V2).
- Pertinence avancée par embedding sémantique (V2).

## Definition of Done

Boki doit pouvoir :
- [ ] Voir la combo bar sticky avec les 3 chips, état complet/partiel/vide.
- [ ] Cliquer "Modifier dans l'Atelier" → setView atelier.
- [ ] Voir 5 onglets, séparés visuellement injectables vs référence.
- [ ] Switch d'onglet conserve la recherche + le mode d'affichage.
- [ ] Toggle Liste/Grille persiste en localStorage.
- [ ] Recherche globale temps réel sur le tab courant.
- [ ] Filtres principaux + avancés (toggle) cumulables (AND).
- [ ] Bouton Reset filtres + search du tab courant.
- [ ] Section "Pertinent pour ta combo" visible si combo complète + au moins 1 match.
- [ ] Click card → Drawer avec détail + preview injection.
- [ ] Combo incomplète → preview désactivé + bandeau warning.
- [ ] Combo complète + tab injectable → 2 boutons Injecter (avec / sans navigation).
- [ ] Création reel optimiste, toast succès.
- [ ] Aucune erreur console.
- [ ] Captures d'écran dans `docs/screenshots/bibliotheque/` (à fournir).

## Découpage

Time-box V1.1 : 1.5 jours full-stack.