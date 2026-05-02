# Vue 02 : BIBLIOTHÈQUE

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

## Objectif

Pool de **briques réutilisables**. Boki navigue, filtre, et **injecte** un élément dans la combinaison courante de l'Atelier (avatar + angle + pain).

C'est un magasin, pas un atelier. Pas d'édition complexe en V1 : les hooks/scripts s'éditent dans Grist directement.

Usage type : "j'ai sélectionné une combo dans l'Atelier, je viens chercher un hook qui matche, je l'injecte → ça crée un reel pré-rempli, je retourne dans l'Atelier finaliser."

## Layout

Une page, 5 tabs.

```
┌──────────────────────────────────────────────────────────────────┐
│ [Hooks 124] [Scripts 38] [Formats] [Ressources 40] [Taxo 60]    │
├──────────────────────────────────────────────────────────────────┤
│ 🔎 Recherche...                                                  │
│ [categorie ▼] [signal_algo ▼] [potentiel ▼]              × Reset│
├──────────────────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                                 │
│ │card │ │card │ │card │ │card │                                 │
│ └─────┘ └─────┘ └─────┘ └─────┘                                 │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                                 │
│ │card │ │card │ │card │ │card │                                 │
│ └─────┘ └─────┘ └─────┘ └─────┘                                 │
└──────────────────────────────────────────────────────────────────┘

(Drawer right au click sur card)
┌────────────────────────┐
│ Hook : "On t'avait..." │
│ ───                    │
│ texte complet          │
│ categorie              │
│ methode_ou_trigger     │
│ signal_algo (chips)    │
│ potentiel (badge)      │
│                        │
│ Combinaison courante : │
│  Marie + Mère-conseil  │
│  + Téléphone à table   │
│                        │
│ [Injecter ↗]           │
└────────────────────────┘
```

## Tabs

### 1. Hooks (table `Hooks`)
**Card :** `texte` (3 lignes ellipsis), badge `categorie`, chip `methode_ou_trigger`, chips `signal_algo_cible` (max 3 visibles), badge `potentiel`.
**Filtres :** `categorie`, `signal_algo` (multi), `potentiel`.
**Action injection :** crée un Reel via `useCreateReel` avec :
- `avatar`, `angle`, `probleme` = depuis store (combinaison courante)
- `hook_verbal` = `hook.texte`
- `cta_type` / `cta_texte` = depuis `hook.cta_associe` (si parsable)
- `signal_algo` = `hook.signal_algo_cible`
- `statut` = `concept`

### 2. Scripts (table `Scripts`)
**Card :** `titre`, `sujet`, `duree_sec` (badge), badges `categorie`/`angle`, preview `structure_body`.
**Filtres :** `categorie`, `angle`, range `duree_sec` (slider 0-90s), `pain_point_cible` (text contains).
**Action injection :** crée un Reel pré-rempli avec `titre`, `hook_verbal`, `structure_body`, `cta_type`, `cta_texte`, `signal_algo` (depuis script), `duree_sec`, `statut: 'scripté'`. Plus avatar/angle/probleme du store.

### 3. Formats (statique en V1)
Pas de table. Liste constante exportée depuis `views/bibliotheque/formats.ts` :
- Duel (2 personnes)
- Monologue caméra
- Tutoriel
- Réaction
- Coulisses
- Skit / mise en scène
- Talking head + B-roll
- Trio
- Compilation rapide
**Card :** nom, description courte, icône Lucide.
**Action :** pas d'injection en V1. Les formats sont des conventions.

### 4. Ressources (table `Ressources`)
**Card :** `nom`, badge `categorie`, badge `prix`, score `score_priorite` (1-5 stars), preview `usage_recommande`.
**Filtres :** `categorie`, `score_priorite` (range).
**Action injection :** ajoute la ressource aux notes de la combinaison courante (en V1 : on l'ajoute à la `description` du Reel le plus récent de la combo, ou simple toast "noté").

### 5. Taxonomie (table `Taxonomie`)
**Card :** badge `type`, `nom`, preview `definition`, `exemple_wubo`.
**Filtres :** `type`.
**Action :** pas d'injection. Drawer expose `quand_utiliser`.

## Mécanique injection

```ts
const { currentAvatarId, currentAngleId, currentPainId } = useAppStore();

const canInject = currentAvatarId && currentAngleId && currentPainId;

if (!canInject) {
  toast.error("Sélectionne une combinaison complète dans l'Atelier (avatar + angle + pain) avant d'injecter.");
  return;
}

if (type === 'hook') {
  await createReel({
    avatar: currentAvatarId,
    angle: currentAngleId,
    probleme: currentPainId,
    hook_verbal: hook.texte,
    signal_algo: hook.signal_algo_cible,
    statut: 'concept',
    titre: `Hook ${hook.id}`,
  });
}
toast.success(`Hook injecté. Va dans l'Atelier pour finaliser.`, {
  duration: 4000,
  action: { label: "Aller à l'Atelier", onClick: () => setView('atelier') },
});
```

## Données utilisées

| Table | Lecture | Écriture |
|---|---|---|
| Hooks | ✓ | — |
| Scripts | ✓ | — |
| Series | ✓ | — (dérivation Formats si besoin) |
| Ressources | ✓ | — |
| Taxonomie | ✓ | — |
| Reels | — | ✓ (création par injection) |

## Hooks shared utilisés
- `useHooks`, `useScripts`, `useRessources`, `useTaxonomie`
- `useCreateReel`
- Store : `currentAvatarId`, `currentAngleId`, `currentPainId`, `setView`

## Composants à créer dans `src/views/bibliotheque/components/`

- `BibliothequeShell.tsx` (5 tabs + filtres + grid)
- `HookCard.tsx`, `ScriptCard.tsx`, `FormatCard.tsx`, `RessourceCard.tsx`, `TaxoCard.tsx`
- `BibliothequeDrawer.tsx` (Drawer shared avec slot enfant typé)
- `BibliothequeFilterBar.tsx` (filtres dynamiques selon tab)
- `formats.ts` (constante)
- `injectionLogic.ts` (helpers de mapping brique → reel pré-rempli)

## États
- **Loading** : skeleton de 8 cards par tab.
- **Empty filtres** : "Aucune brique ne matche tes filtres." + bouton Reset.
- **Empty data** : "Aucun hook importé. Ajoute via Grist." + lien externe.
- **Erreur** : toast + bouton Reset clé API au niveau Shell.

## Hors-scope V1
- Édition / création de briques depuis cette vue.
- Tri par "popularité d'injection".
- Multi-injection (sélection multiple).

## Definition of Done

Boki doit pouvoir :
- [ ] Voir les 5 tabs avec compteurs.
- [ ] Switch de tab change le grid + filtres applicables.
- [ ] Recherche temps réel sur le tab courant.
- [ ] Filtres Choice / Range / Multi cumulables (AND).
- [ ] Bouton Reset filtres + recherche.
- [ ] Click card → Drawer avec détail complet.
- [ ] Bouton Injecter dans le Drawer :
  - Si combo incomplète (un des 3 = null) → toast erreur.
  - Sinon → création reel + toast succès avec action "Aller à l'Atelier".
- [ ] Toast succès affiche raccourci de navigation.
- [ ] Aucune erreur console.
- [ ] Captures d'écran dans `docs/screenshots/bibliotheque/` :
  - tab-hooks.png, drawer-hook-detail.png, injection-success.png, injection-error-no-combo.png, empty-state.png

## Découpage suggéré

Time-box V1 : 1.5 jours full-stack, ou 1 jour designer + 1 jour dev en parallèle.
