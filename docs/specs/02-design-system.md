# Design system

## Pour qui
Designer + dev. Tous les agents lisent ce doc avant de coder. Le PO maintient ce doc à jour quand il ajoute des composants à `src/shared/components/`.

## Principes

1. **Tokens d'abord, jamais de hex en dur** dans le code des vues.
2. **Densité Notion-like sur l'Atelier**, plus aérée sur Bibliothèque/Veille.
3. **Offset shadows solides, zéro blur** : c'est l'ADN visuel Wubo.
4. **Pas de couleur juste pour décorer**. Couleur = sens (jaune = action, violet = focus, pink = erreur, etc.).
5. **Animations subtiles**. 150-250ms max. Pas d'effet "wow".
6. **Lucide icons stroke 1.5, taille 16/20/24 uniquement**.

## Tokens (déjà dans `tailwind.config.ts`)

### Couleurs (utiliser via classes Tailwind)

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#F4F3F7` | fond global de l'app |
| `surface` | `#FFFFFF` | cartes, modales, drawers |
| `surface-alt` | `#ECEAF1` | sous-fond, headers de cards |
| `surface-two` | `#F7F5FA` | sub-bg légèrement violet |
| `border` | `#E5DFD9` | bordures standard |
| `border-strong` | `#B8B0A8` | bordures accentuées |
| `text` | `#191919` | texte principal |
| `text-dim` | `#4A4A4A` | texte secondaire |
| `text-faint` | `#6B6B6B` | texte tertiaire |
| `text-muted` | `#8A8278` | placeholders |
| `accent` | `#FFDD0B` | jaune Wubo, CTA principal, action |
| `accent-soft` | `#FFF6BC` | fond doux jaune |
| `current` | `#5914D0` | violet Wubo, focus, sélection |
| `current-soft` | `#EEE2FB` | fond doux violet |
| `info` | `#1DC1F9` | bleu, infos neutres |
| `info-soft` | `#E0F6FE` | fond doux bleu |
| `danger` | `#D40272` | pink, erreur, destruction |
| `danger-soft` | `#FFE3EE` | fond doux pink |
| `success` | `#1F8A4A` | vert, validation |
| `success-soft` | `#E5F4ED` | fond doux vert |
| `warning` | `#B36B00` | orange, attention |
| `warning-soft` | `#FFF1D6` | fond doux orange |

### Typographie
- Famille : `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial`.
- Échelle : `text-[11px]` (badge) / `text-xs` (12) / `text-sm` (14) / `text-base` (16) / `text-lg` (18) / `text-xl` (20) / `text-2xl` (24).
- Weight : `font-medium` pour titres, `font-semibold` pour CTA, `font-normal` pour body.
- Line-height : `leading-tight` pour titres, `leading-normal` pour body, `leading-relaxed` pour paragraphes longs.

### Spacing scale
Tailwind par défaut : 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px.
- Padding card body : `p-4` (16px).
- Gap entre sections : `gap-3` (12px) ou `gap-4` (16px).
- Gap entre items dans une liste : `gap-2` (8px).

### Border-radius
- `rounded-sm` (4px) : badges, chips, petits boutons.
- `rounded-md` (6px) : boutons standards, inputs, cards.
- `rounded-lg` (10px) : modales, drawers, cards principales.
- `rounded-full` : avatars ronds, dots de couleur.

### Box-shadow (offset solide)
- `shadow-sm` : `1px 1px 0 #B8B0A8` (boutons, inputs au repos).
- `shadow-md` : `0 2px 0 #E5DFD9` (cards standard).
- `shadow-lg` : `2px 2px 0 #191919` (cards principales, modales).

### Animations (framer-motion)
- Durée standard : `150ms` (micro-interactions, hover).
- Durée transition : `250ms` (modales, drawers, page transitions).
- Durée énergique : `400ms` (feedback succès, célébration).
- Easing : `cubic-bezier(0.32, 0.72, 0, 1)` (sortie naturelle, "soft spring").

## Atomes (`src/shared/components/`)

### Button
```tsx
<Button variant="primary" size="md" loading={false} disabled={false}>
  Texte
</Button>
```
Variants : `primary` (jaune), `secondary` (outline border-strong), `ghost` (transparent), `danger` (pink).
Sizes : `sm` (h-7 px-2 text-xs), `md` (h-9 px-3 text-sm), `lg` (h-11 px-4 text-base).
States : default / hover (brightness-95) / active (translate-x-px translate-y-px shadow-none) / focus (ring-2 ring-current) / disabled (opacity-40) / loading (spinner inline + texte).

### IconButton
```tsx
<IconButton icon={Plus} label="Ajouter" tone="default" size="md" />
```
Tones : `default`, `primary` (jaune), `danger` (pink).
Sizes : `sm` (h-7 w-7), `md` (h-9 w-9).
**Toujours** un `label` pour l'accessibilité (aria-label).

### Input / Textarea
```tsx
<Input value={...} onChange={...} placeholder="..." error="message si invalide" />
<Textarea rows={3} ... />
```
Variant `error` change la border en `danger` + affiche le message en dessous.
Focus : `ring-2 ring-current/40 border-current`.

### Select (natif stylé)
```tsx
<Select value={...} onChange={...}>
  <option value="a">A</option>
</Select>
```
Pour un select riche (search, multi), utiliser le composant `RichSelect` (Radix Select) à venir.

### Badge
Variants : `default` (gris), `accent` (jaune), `current` (violet), `info`, `success`, `warning`, `danger`, `outline`.
Custom : `<Badge color="#FF00AA" soft>Texte</Badge>` pour utiliser une couleur arbitraire (e.g. couleur d'une série).

### Chip
Comme Badge mais cliquable. Optionnellement avec `<X />` pour suppression.
```tsx
<Chip onClick={...} onRemove={...}>Filtre actif</Chip>
```

### ColorBadge
Rond coloré pour signaler une couleur (ex couleur d'un avatar/angle).
```tsx
<ColorBadge colorHex="#5914D0" size="sm" />
```

### Spinner
```tsx
<Spinner size="sm" />
```

### Skeleton
```tsx
<Skeleton className="h-8 w-32" />
```

## Molécules

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardBody>...</CardBody>
</Card>
```
Hoverable optionnel : `<Card hoverable>` ajoute hover:bg-surface-alt + cursor-pointer.

### Modal (Radix Dialog)
```tsx
<Modal open={open} onOpenChange={setOpen} title="Titre" size="md">
  Contenu
  <ModalFooter>
    <Button variant="ghost" onClick={...}>Annuler</Button>
    <Button variant="primary" onClick={...}>Valider</Button>
  </ModalFooter>
</Modal>
```
Sizes : `sm` (400px), `md` (560px), `lg` (800px).
Closes on Escape. **Ne ferme pas** au click outside si formulaire dirty (passer `dismissible={false}`).

### Drawer (Radix Dialog avec slide right)
```tsx
<Drawer open={open} onOpenChange={setOpen} title="Détail" width={380}>
  Contenu scroll
</Drawer>
```

### Tabs (Radix Tabs)
```tsx
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="hooks" count={124}>Hooks</TabsTrigger>
    <TabsTrigger value="scripts" count={38}>Scripts</TabsTrigger>
  </TabsList>
  <TabsContent value="hooks">...</TabsContent>
</Tabs>
```

### Tooltip (Radix Tooltip)
```tsx
<Tooltip content="Aide contextuelle">
  <button>?</button>
</Tooltip>
```
Délai d'apparition : 300ms.

### ConfirmDialog
```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Supprimer ce reel ?"
  description="Cette action est irréversible."
  tone="danger"
  confirmLabel="Supprimer"
  onConfirm={async () => { await deleteReel(id); }}
/>
```
Tones : `normal` (bouton primary), `danger` (bouton rouge).

### EmptyState
```tsx
<EmptyState
  icon={<Sparkles size={28} />}
  title="Aucune campagne"
  description="Crée ta première campagne pour commencer."
  action={<Button variant="primary">+ Nouvelle campagne</Button>}
/>
```

### FormField (wrapper react-hook-form)
```tsx
<FormField label="Nom" error={errors.nom?.message} required>
  <Input {...register('nom')} />
</FormField>
```

### Toast (react-hot-toast)
```tsx
import { toast } from 'react-hot-toast';
toast.success('Avatar créé');
toast.error('Erreur Grist');
toast('Info neutre', { icon: 'ℹ️' });
```
Position globale : top-right. Durée : 3000ms succès, 5000ms erreur.

## Patterns

### Master-detail-detail (3 colonnes)
- Largeur gauche : 280px fixe.
- Largeur droite : 380px collapsible (toggle dans le header).
- Centre : flex-1.
- Bordures verticales : `border-x border-border` entre les colonnes.

### Liste / Grid
- Grid : `grid-cols-2` (sm), `grid-cols-3` (md), `grid-cols-4` (lg). Gap `gap-3`.
- Liste verticale : `flex flex-col gap-2`.
- Empty state centré dans la zone : `flex items-center justify-center min-h-[200px]`.

### Formulaire
- Layout vertical par défaut : `flex flex-col gap-3`.
- Labels au-dessus des inputs.
- Erreurs sous les inputs en `text-xs text-danger`.
- Footer avec bouton primary à droite, ghost à gauche.

### Loading state
- Liste : 6 skeletons de la taille des items réels.
- Page : skeleton du layout.
- Bouton mutation : `<Spinner size="sm" />` à la place du label.

## Anti-patterns à éviter

- **Pas de drop-shadow blurry** (`shadow-xl` Tailwind par défaut). Toujours offset solide.
- **Pas de gradients** sauf cas explicite validé par le PO.
- **Pas de `text-gray-XXX`** en dur. Utiliser `text-text`, `text-text-dim`, `text-text-faint`.
- **Pas de `bg-white`** en dur. Utiliser `bg-surface`.
- **Pas de placeholder rempli** par défaut. Le placeholder est un hint, pas une valeur.
- **Pas d'icône sans label** pour les boutons (sauf pictogrammes universels comme close `X`).
- **Pas de modale qui se ferme au click outside** si formulaire dirty.
- **Pas d'emoji** dans le code source ou les commits.

## Page Playground

`src/app/Playground.tsx` montre tous les atomes et molécules en variants. Accessible via `?playground=1` ou bouton dans le footer du Shell.

C'est la **référence visuelle vivante**. Quand un agent doute, il ouvre le Playground.
