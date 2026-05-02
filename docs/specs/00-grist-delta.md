# Delta Grist : modèle combinatoire

## Statut : APPLIQUÉ

## Modèle final

Le modèle suit la pratique standard creative strategist (Foreplay, Marketer's Brief, media buyers Meta) :

```
Avatar (n)         ← QUI on vise (pool indépendant)
Angle (n)          ← LA BIG IDEA stratégique (pool indépendant, N:N avec Avatar)
Pain (n)           ← LA DOULEUR PRÉCISE (pool indépendant, N:N avec Avatar et Angle)
Reel               ← L'unité combinatoire : (avatar, angle, pain) + hook + body + CTA
                     + angle_precis : la variation créative spécifique
```

Pas de table `Pilliers`. Pas de table `Campagnes`. La "combinaison" est encodée dans chaque Reel via ses Refs.

## Modifications appliquées

### 1. Table `Angles` : ajout d'1 colonne
| Col | Type | Notes |
|---|---|---|
| `avatars` | RefList:Avatar | visible_col `prenom`. N:N avec Avatar. Un angle peut s'appliquer à plusieurs avatars. |

### 2. Table `Pain_points` : ajout de 2 colonnes
| Col | Type | Notes |
|---|---|---|
| `avatars` | RefList:Avatar | visible_col `prenom`. Quels avatars vivent cette douleur. |
| `angles` | RefList:Angles | visible_col `nom`. Quels angles permettent d'attaquer cette douleur. |

### 3. Table `Reels` : ajout de 4 colonnes
| Col | Type | Notes |
|---|---|---|
| `avatar` | Ref:Avatar | visible_col `prenom`. L'avatar ciblé par ce reel. |
| `angle` | Ref:Angles | visible_col `nom`. L'angle stratégique. |
| `probleme` | Ref:Pain_points | visible_col `titre`. Le pain précis attaqué. |
| `angle_precis` | Text | La variation créative. Ex : "comparaison brutale", "métaphore objet du quotidien". |

La col existante `serie` (Text) reste, devient legacy. Peut être ignorée par les widgets.

## Tables non touchées

Aucune autre table modifiée. Les 17 tables existantes restent intactes :
Avatar, Pain_points, Angles, Sujets, Concurrents, Videos_virales, Tendances, Series, Reels, Sessions_tournage, Hooks, Scripts, Broll, Influenceurs, Ressources, Taxonomie, Metriques_reels.

## Conséquences pour le code

`src/shared/lib/types.ts` doit ajouter :
```ts
export interface Angle {
  // existants : id, nom, ton, description, force, faiblesse, meilleur_pour, cible_primaire
  avatars?: number[];           // RefList Grist : array d'IDs avatars
}
export interface PainPoint {
  // existants : id, titre, description, chiffre_source, emotion_dominante, frequence_vecue, niveau_intensite
  avatars?: number[];
  angles?: number[];
}
export interface Reel {
  // existants : id, titre, jour, serie, type, duree_sec, objectif, signal_algo, semaine, statut, hook_*, structure_body, cta_*, production_*, personnes, prediction_metrique
  avatar?: number;
  angle?: number;
  probleme?: number;
  angle_precis?: string;
}
```

Décodage RefList : Grist renvoie `["L", id1, id2, ...]` ou `null` ou un array brut. Le helper `decodeRefList` de `src/shared/lib/utils.ts` gère les 3 cas.

## Statuts Reels (rappel, non touché)

Existant : `concept | scripté | filmé | monté | posté | analysé`. En V1 frontend, on n'expose que **3 niveaux** synthétiques :
- `idée` (concept)
- `prêt` (scripté + filmé + monté)
- `posté` (posté + analysé)

Le mapping se fait au niveau du widget. La col Grist garde ses 6 valeurs.
