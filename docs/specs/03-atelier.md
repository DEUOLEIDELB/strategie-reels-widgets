# Vue 01 : ATELIER (le killer)

> **Lis d'abord `01-shared.md` et `02-design-system.md` avant ce doc.**

## Objectif

La vue de travail. Boki vient ici pour assembler des **combinaisons** Avatar × Angle × Pain et générer des Reels (variations créatives) à partir de chaque combinaison.

C'est le coeur de l'outil. 80% de l'usage. Si cette vue n'est pas fluide, le projet échoue.

## Modèle mental (creative strategist)

```
Avatar (n)                    ← QUI
   │
   └── Angle (n associés)     ← LA BIG IDEA
          │
          └── Pain (n)        ← LA DOULEUR PRECISE
                 │
                 └── Reel (n) ← LA REPONSE CREATIVE (hook + body + CTA + angle_precis)
```

Pools indépendants. N:N libres. La combinaison se matérialise au niveau du Reel via ses Refs (avatar, angle, probleme).

## Layout : 3 colonnes

```
┌────────────────┬─────────────────────────────────────┬────────────────────┐
│ NAVIGATEUR     │ CANVAS COMBINAISON                  │ PANNEAU BRIQUE     │
│ 280 px         │ flex                                │ 380 px collapsible │
├────────────────┼─────────────────────────────────────┼────────────────────┤
│ ▼ AVATARS (5)  │ ┌─ Combinaison courante ─────────┐  │ Brique sélec.      │
│   ● Marie      │ │ Avatar : [Marie ▼]              │  │                    │
│   ● David      │ │ Angle  : [Mère-conseil ▼]       │  │ [Détail][Édition]  │
│   ● Sophie     │ │ Pain   : [Téléphone à table ▼]  │  │ [Suggestions]      │
│   + Nouvel av. │ └─────────────────────────────────┘  │                    │
│                │                                      │ Contenu selon le   │
│ ▼ ANGLES (8)   │ ▸ 4 reels matchent cette combo       │ type de brique :   │
│   ● Mère-cons. │   ┌──────────────┐ ┌──────────────┐  │  - Avatar          │
│   ● Polémique  │   │ R1 [idée]    │ │ R2 [prêt]    │  │  - Angle           │
│   ● Tutoriel   │   │ Hook: "..."  │ │ Hook: "..."  │  │  - Pain            │
│   + Nouv ang.  │   │ Angle préc.: │ │ Angle préc.: │  │  - Reel            │
│                │   │ comparaison  │ │ métaphore    │  │                    │
│ ▼ PAINS (12)   │   └──────────────┘ └──────────────┘  │                    │
│   ● Téléphone..│   ┌──────────────┐ + Nouveau reel    │                    │
│   ● Mensonge.. │   │ R3 [posté]   │                   │                    │
│   + Nouv pain  │   └──────────────┘                   │                    │
│                │                                      │                    │
│ ─────          │ Suggestions à la combo :             │                    │
│ Vue tabulaire  │  - 3 hooks pertinents                │                    │
│ "Tous reels"   │  - 2 vidéos virales similaires       │                    │
└────────────────┴─────────────────────────────────────┴────────────────────┘
```

## Comportement détaillé

### Colonne gauche : Navigateur (280 px)

3 sections collapsibles : **AVATARS**, **ANGLES**, **PAINS**. Pas de sous-arborescence. Tout est plat (parce que les pools sont indépendants).

**Chaque item de section :**
- Affiche : un dot coloré (couleur dérivée du nom hash) + nom + count d'associations.
- Click : sélectionne l'item dans la combinaison courante (`setCurrentAvatar/Angle/Pain`).
- Double-click ou icône loupe : ouvre la brique dans le panneau droite (`setCurrentBrique`).
- Hover : menu kebab → Renommer / Modifier / Dupliquer / Supprimer (avec ConfirmDialog).
- Drag-drop : réordonner dans la section.

**Bouton + en bas de chaque section** : ouvre la modale de création (`AvatarForm`, `AngleForm`, `PainForm`).

**Section secondaire en bas :**
- Vue tabulaire "Tous les reels" : ouvre une vue plate filtrable de tous les reels (utile pour explorer hors combo).

**Filtrage de la liste Angle/Pain selon Avatar courant :**
- Si `currentAvatarId` set : on **highlight** (pas filtre) les angles dont `avatars` contient l'avatar courant. Les autres angles restent visibles mais grisés.
- Idem pour les pains.
- Toggle dans le header de section : "Tous" / "Compatibles avec Marie".

### Colonne centre : Canvas Combinaison

**Header (sticky en haut) :**
3 chips horizontales avec le nom de l'item sélectionné :
- `[Avatar : Marie ▼]` (cliquable → dropdown des avatars).
- `[Angle : Mère-conseil ▼]` (cliquable → dropdown des angles, optionnellement filtrés sur l'avatar).
- `[Pain : Téléphone à table ▼]` (cliquable → dropdown des pains, optionnellement filtrés sur avatar+angle).

Si une chip est vide : "Choisir un avatar / angle / pain". Bouton primary jaune.

**Body :**

**Cas 1 : combinaison incomplète (au moins une chip vide)**
- EmptyState : "Complète la combinaison pour voir les reels."
- Suggestions selon ce qui est déjà sélectionné : "Avec Marie, voici 3 angles populaires" (par count d'associations).

**Cas 2 : combinaison complète (avatar + angle + pain set)**
- Section "Reels matchant cette combinaison" :
  - Grid de cards `ReelCard` (3 colonnes desktop).
  - Card affiche : statut (badge synthétique idée/prêt/posté), titre, hook_verbal (preview), angle_precis (badge violet), durée.
  - Click : sélectionne le reel dans le panneau droite.
  - Bouton `+ Nouveau reel` : crée un reel pré-rempli (avatar + angle + probleme = ceux de la combo) et l'ouvre dans le panneau pour édition.
- Section "Suggestions à la combo" (en dessous) :
  - 3 hooks pertinents (table Hooks filtrés par signal_algo).
  - 2 vidéos virales similaires (table Videos_virales filtrées par categorie_pain_point match).
  - Chaque suggestion a un bouton "Créer reel à partir de" qui ouvre le ReelForm pré-rempli.

### Colonne droite : Panneau Brique (380 px, collapsible)

Onglets : **Détail** / **Édition** / **Suggestions**.

**Si Avatar (`currentBrique.type === 'avatar'`) :**
- Détail : photo (placeholder si vide), prenom, age_range, lieu, situation_familiale, profession, revenus_foyer, reseau_principal, description_synthese, declencheurs_achat, objections.
- Édition : tous les champs ci-dessus, save sur blur.
- Suggestions : angles associés à cet avatar + pains associés à cet avatar.

**Si Angle :**
- Détail : nom, ton, description, force, faiblesse, meilleur_pour, cible_primaire, avatars associés (chips).
- Édition.
- Suggestions : pains associés à cet angle (avec score = niveau_intensité).

**Si Pain :**
- Détail : titre, description, chiffre_source, emotion_dominante (badge), frequence_vecue (badge), niveau_intensite (1-5 en barres), avatars + angles associés.
- Édition.
- Suggestions :
  - **Hooks** pertinents (filtrés par signal_algo).
  - **Scripts templates** pertinents (par pain_point_cible).
  - **Vidéos virales** similaires (par categorie_pain_point).
  - Bouton "Créer reel" sur chaque suggestion → ReelForm pré-rempli.

**Si Reel :**
- Détail : titre, statut (synthétique idée/prêt/posté), avatar, angle, probleme, angle_precis, hook_verbal, hook_visuel, titre_overlay, structure_body, cta_type, cta_texte, signal_algo, duree_sec, production_lieu, personnes, prediction_metrique.
- Édition (formulaire complet).
- Suggestions :
  - Brolls (table Broll filtrée par signal_algo).
  - Bouton "Ouvrir Bibliothèque > Hooks" → setView('bibliotheque') + filtre auto.

## Données utilisées

| Table | Lecture | Écriture |
|---|---|---|
| Avatar | ✓ | ✓ (CRUD) |
| Angles | ✓ | ✓ (CRUD, manage avatars RefList) |
| Pain_points | ✓ | ✓ (CRUD, manage avatars + angles RefList) |
| Reels | ✓ | ✓ (CRUD, filtrable par avatar/angle/probleme) |
| Hooks | ✓ | — (suggestions) |
| Scripts | ✓ | — |
| Videos_virales | ✓ | — |
| Broll | ✓ | — |

## Hooks shared utilisés

Voir `01-shared.md` section "Hooks Grist partagés". Ceux dont tu as besoin :
- `useAvatars`, `useCreateAvatar`, `useUpdateAvatar`, `useDeleteAvatar`
- `useAngles`, `useCreateAngle`, `useUpdateAngle`, `useDeleteAngle`
- `usePainPoints`, `useCreatePainPoint`, `useUpdatePainPoint`, `useDeletePainPoint`
- `useReels(filters)`, `useCreateReel`, `useUpdateReel`, `useDeleteReel`
- `useHooks`, `useScripts`, `useVideosVirales`, `useBroll`

## Composants à créer dans `src/views/atelier/components/`

**Layout :**
- `AtelierShell.tsx` (3 colonnes, gestion collapse panneau droite)

**Navigateur :**
- `Navigator.tsx`
- `PoolSection.tsx` (générique : titre + count + items + bouton +)
- `PoolItem.tsx` (avatar/angle/pain item with dot + name + menu)

**Canvas :**
- `Canvas.tsx`
- `ComboHeader.tsx` (3 chips combinaison)
- `ComboChip.tsx` (chip avec dropdown de sélection)
- `ReelGrid.tsx`
- `ReelCard.tsx`
- `ComboSuggestions.tsx`
- `EmptyCombo.tsx`

**Panneau droite :**
- `BriquePanel.tsx` (router selon type)
- `BriqueDetailAvatar.tsx`, `BriqueDetailAngle.tsx`, `BriqueDetailPain.tsx`, `BriqueDetailReel.tsx`
- `BriqueEditAvatar.tsx`, `BriqueEditAngle.tsx`, `BriqueEditPain.tsx`, `BriqueEditReel.tsx`
- `SuggestionsAvatar.tsx`, `SuggestionsAngle.tsx`, `SuggestionsPain.tsx`, `SuggestionsReel.tsx`

**Modales (utilisent Modal shared) :**
- `AvatarForm.tsx`, `AngleForm.tsx`, `PainForm.tsx`, `ReelForm.tsx`

**Utilities (dans `views/atelier/lib/`) :**
- `colorFromName.ts` (hash deterministic name → couleur dot)
- `filterReelsByCombo.ts` (filtre reels par avatar+angle+pain)
- `synthStatut.ts` (mapping concept/scripté/filmé/monté/posté/analysé → idée/prêt/posté)

## États
- **Loading** : skeleton sur navigator + canvas pendant `useAvatars.isLoading`.
- **Empty global** : aucun avatar → empty state du Navigator + CTA "Créer ton premier avatar".
- **Empty combo** : aucune brique sélectionnée → message "Sélectionne un avatar pour commencer".
- **Erreur** : si Grist 401/403, panneau erreur global avec bouton `Réinitialiser clé API` (depuis Shell).
- **Optimistic** : tous les CRUD sont optimistes (mutation update immédiat, rollback si échec via toast).

## Hors-scope V1
- Métriques de performance (zéro reel posté, prématuré).
- Calendrier temporel.
- Multi-utilisateurs / collaboration.
- Diff visuel entre 2 combinaisons (V2).
- Templating de combinaison (V2).
- Drag-drop reel d'une combo à une autre (V2).

## Definition of Done (Atelier V1)

Boki doit pouvoir :
- [ ] Créer un avatar (modale → sauvegarde → apparaît dans navigator).
- [ ] Créer un angle, l'associer à 1+ avatars (RefList).
- [ ] Créer un pain, l'associer à 1+ avatars + 1+ angles (RefList).
- [ ] Sélectionner avatar + angle + pain dans le canvas (combinaison complète).
- [ ] Voir les reels matchant la combo.
- [ ] Créer un reel pré-rempli depuis la combo courante.
- [ ] Éditer chaque brique dans le panneau droite (save inline).
- [ ] Supprimer chaque brique avec ConfirmDialog.
- [ ] Voir suggestions contextuelles : hooks pertinents pour un Pain, brolls pour un Reel.
- [ ] Filtrer/highlight les angles et pains compatibles avec l'avatar courant.
- [ ] Aucune erreur console en parcours nominal.
- [ ] Captures d'écran dans `docs/screenshots/atelier/` :
  - empty.png, navigator.png, canvas-combo-incomplete.png, canvas-combo-complete.png,
  - panneau-avatar.png, panneau-pain-suggestions.png, modale-creation-pain.png

## Découpage suggéré

**Designer livre d'abord :**
- Maquettes 3 colonnes en variants (empty, populated).
- Composants visuels purs : `Navigator`, `PoolSection`, `PoolItem`, `ComboHeader`, `ComboChip`, `ReelCard`, `BriquePanel` shells.

**Dev consomme ensuite :**
- Branche les hooks Grist sur les composants.
- Implémente formulaires (react-hook-form + zod).
- Implémente la logique de suggestions et filtres clientside.
- Implémente le synthStatut et colorFromName.

Time-box V1 : 3 jours full-stack, ou 1.5 jour designer + 1.5 jour dev en parallèle.
