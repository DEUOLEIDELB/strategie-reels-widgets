# Shared : foundations communes

## Pour qui
TOUS les agents (dev + designer) avant de toucher au code. Lis-moi en entier avant ta première modif.

## Le projet
**strategie-reels-widgets** : interface custom Grist pour piloter la stratégie Reels Wubo. Outil de **creative strategist** : on assemble des combinaisons (Avatar × Angle × Pain) et on génère des variations (Reels) à partir de ces combinaisons.

- Stack : Vite 5 + React 18 + TS strict + Tailwind 3.
- Server state : TanStack Query (optimistic updates).
- UI state : Zustand.
- Primitives : Radix UI (Dialog, Tabs, Tooltip, Select, Popover, ScrollArea, Separator).
- Animations : framer-motion.
- Drag-drop : dnd-kit.
- Forms : react-hook-form + zod.
- Toasts : react-hot-toast.
- Icons : lucide-react.
- Backend : doc Grist (URL et ID configurés côté code, voir `src/shared/lib/grist-api.ts`).

## Modèle de données

```
Avatar (pool)        independent
Angle (pool)         N:N avec Avatar via Angles.avatars
Pain (pool)          N:N avec Avatar et Angles via Pain_points.avatars / .angles
Reel                 (avatar, angle, probleme) + hook + body + cta + angle_precis
```

Lis `00-grist-delta.md` pour le détail des colonnes.

## Architecture : 3 vues

1. **ATELIER** (killer) : navigation Avatar → Angle → Pain → Reels. 80% de l'usage.
2. **BIBLIOTHÈQUE** : pool de briques injectables (Hooks, Scripts, Formats, Ressources, Taxonomie).
3. **VEILLE** : inspiration externe read-only (Vidéos virales, Concurrents, Tendances).

Header transversal `Shell` : switcher de vues + indicateur statut clé API + bouton reset.

## Structure des dossiers (OBLIGATOIRE)

```
src/
├── views/
│   ├── atelier/          # AGENT atelier modifie ICI uniquement
│   │   ├── components/
│   │   ├── AtelierShell.tsx
│   │   └── index.tsx
│   ├── bibliotheque/     # AGENT biblio modifie ICI uniquement
│   │   ├── components/
│   │   ├── BibliothequeShell.tsx
│   │   └── index.tsx
│   └── veille/           # AGENT veille modifie ICI uniquement
│       ├── components/
│       ├── VeilleShell.tsx
│       └── index.tsx
├── shared/               # PO uniquement, NE TOUCHE PAS
│   ├── components/       # atomes + molécules design system
│   ├── hooks/
│   │   ├── grist/        # useAvatars, useAngles, etc.
│   │   └── ui/           # useDebounce, useOutsideClick
│   ├── lib/
│   │   ├── grist-api.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── styles.css
│   ├── store.ts
│   └── tokens.ts
└── app/                  # PO uniquement
    ├── Shell.tsx         # header global, switcher de vues
    ├── App.tsx           # router des 3 vues
    ├── Playground.tsx    # démo design system
    └── main.tsx          # entry
```

## Règles d'or pour les agents

### 1. Tu ne touches QUE ton dossier `views/<le-tien>/`
- Composant manquant ? Crée-le dans `views/<le-tien>/components/`. Si réutilisable ailleurs, signale au PO (il le promeut éventuellement vers `shared/`).
- Hook Grist manquant ? **Tu ne crées PAS de hook Grist toi-même.** Tu signales au PO.
- Endpoint Grist ? Utilise UNIQUEMENT les hooks de `shared/hooks/grist/`.

### 2. Zones interdites en écriture
- `src/shared/` (tout)
- `src/app/`
- `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `postcss.config.js`
- `index.html` à la racine
- Toute config CI/CD (.github/, etc.)
- Le dossier d'un autre agent (`views/<pas-le-tien>/`)

### 3. Pas de dépendance npm ajoutée sans validation PO
Tu **demandes** au PO via blocker. Le PO décide.

### 4. Communication via blockers
Bloqué ? Crée `docs/specs/blockers/<vue>-<YYYY-MM-DD>-<slug>.md` :
```md
# Blocker : <titre court>
**Vue** : atelier
**Type** : [composant manquant / hook manquant / dépendance / schéma Grist / autre]

## Quoi
Ce que tu veux faire concrètement.

## Pourquoi
Le contexte. Le besoin réel.

## Options envisagées
- A : ...
- B : ...

## Recommandation
Ton instinct.
```
Le PO traite, fait l'ajout dans `shared/`, te déloque.

### 5. Fin de tâche : checklist obligatoire
- [ ] Aucun fichier hors de `views/<le-tien>/` modifié (vérifie `git status`).
- [ ] `npm run build` passe.
- [ ] Feature fonctionne dans Chrome desktop.
- [ ] Captures d'écran dans `docs/screenshots/<vue>/`.
- [ ] Aucune erreur console en parcours nominal.

## Composants design system disponibles dans `src/shared/components/`

Voir `02-design-system.md` pour la spec détaillée de chaque atome et molécule.

Liste rapide :
- **Atomes** : `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Chip`, `IconButton`, `ColorBadge`, `Spinner`, `Skeleton`.
- **Molécules** : `Card` (+ Header/Body), `Modal`, `Drawer`, `Tabs`, `Tooltip`, `ConfirmDialog`, `EmptyState`, `Toast` (via `toast()` de `react-hot-toast`), `FormField`.

## Hooks Grist partagés dans `src/shared/hooks/grist/`

Pattern :
```ts
const QK = {
  avatars: ['avatars'] as const,
  angles: (avatarId?: number) => ['angles', { avatarId }] as const,
};

export function useAvatars() {
  return useQuery({ queryKey: QK.avatars, queryFn: () => fetchRows<Avatar>('Avatar') });
}

export function useCreateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Avatar, 'id'>) => addRecords('Avatar', [data]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.avatars }),
  });
}
```

Hooks fournis (à publier au moment du dispatch) :

**CRUD :**
- `useAvatars`, `useCreateAvatar`, `useUpdateAvatar`, `useDeleteAvatar`
- `useAngles`, `useCreateAngle`, `useUpdateAngle`, `useDeleteAngle`
- `usePainPoints`, `useCreatePainPoint`, `useUpdatePainPoint`, `useDeletePainPoint`
- `useReels(filters?)`, `useCreateReel`, `useUpdateReel`, `useDeleteReel`

**Lecture seule :**
- `useHooks`, `useScripts`, `useRessources`, `useTaxonomie`, `useSeries`
- `useVideosVirales`, `useConcurrents`, `useTendances`
- `useSessions`, `useBroll`, `useMetriquesReels`

Filtres clientside via `useMemo` dans le composant. Pas de filtre serveur en V1.

## Store partagé (`src/shared/store.ts`, Zustand)

```ts
type View = 'atelier' | 'bibliotheque' | 'veille';
type BriqueType = 'avatar' | 'angle' | 'pain' | 'reel';

type Injection =
  | { type: 'hook'; data: Hook }
  | { type: 'script'; data: Script }
  | { type: 'ressource'; data: Ressource };

interface AppStore {
  // Vue active
  view: View;
  setView: (v: View) => void;

  // Sélection courante de l'Atelier (lue par toutes les vues)
  currentAvatarId: number | null;
  currentAngleId: number | null;
  currentPainId: number | null;
  currentBrique: { type: BriqueType; id: number } | null;
  setCurrentAvatar: (id: number | null) => void;
  setCurrentAngle: (id: number | null) => void;
  setCurrentPain: (id: number | null) => void;
  setCurrentBrique: (b: { type: BriqueType; id: number } | null) => void;
  resetSelection: () => void;

  // Bridge Bibliothèque → Atelier (injection)
  pendingInjection: Injection | null;
  triggerInjection: (i: Injection) => void;
  consumeInjection: () => Injection | null;
}
```

## Conventions code

- TypeScript strict, jamais `any` (sauf justification commentée).
- Comments par défaut zéro. Un commentaire = pourquoi non-évident.
- Composants : `PascalCase.tsx`, `export function MyComponent(props: Props)`.
- Hooks : `useCamelCase`, fichier `useCamelCase.ts`.
- **Pas de tiret cadratin (—)** dans aucun texte UI.
- Accents français obligatoires partout dans l'UI.
- Imports : alias `@/` → `src/`.

## Conventions UX

- Pas de close-on-click-outside sur formulaire dirty (perte de saisie = bug).
- Toute action destructive passe par `ConfirmDialog`. Jamais `confirm()` natif.
- Loading : skeleton sur listes, spinner inline sur boutons mutation.
- Erreur : toast rouge + log console.
- Empty state : message + CTA explicite.

## Sécurité

Aucune clé, aucun secret, aucun credential dans le code ou les commits. Saisie utilisateur côté navigateur, stockée localement. Si tu vois une fuite : stop et alerte le PO via blocker.
