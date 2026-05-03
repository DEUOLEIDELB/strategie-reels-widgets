// Patterns visuels et techniques de montage qui marchent en 2026.
// Source : audit web mai 2026 (CapCut trends, MEL Science, CrunchLabs, Hormozi style).
// Pas de duplication avec l'Atelier (les hooks textuels y vivent).

export interface VisualPattern {
  id: string;
  nom: string;
  description: string;
  quand_utiliser: string;
}

export const PATTERNS: VisualPattern[] = [
  {
    id: 'hook_first_frame',
    nom: 'Texte hook dès la frame 0',
    description: 'Texte UPPERCASE bold qui apparaît à la frame 1, position centre-haut, taille 80-100pt, contrast max.',
    quand_utiliser: 'Toujours. La frame 0 décide si on retient ou pas.',
  },
  {
    id: 'cut_3s',
    nom: 'Cut toutes les 2-3 secondes',
    description: 'Jump cut sur les respirations, changements d\'angle, ou cutaway B-roll. Pas plus de 3s sans rupture.',
    quand_utiliser: 'Format face cam. Augmente significativement la rétention en 2026.',
  },
  {
    id: 'beat_sync',
    nom: 'Sync sur le beat de la musique',
    description: 'Aligner les coupes et apparitions de texte sur les downbeats. Volume musique 25-35%, voix 80-90%.',
    quand_utiliser: 'Quand la musique a un BPM marqué (trending sounds).',
  },
  {
    id: 'riser_payoff',
    nom: 'Riser + payoff',
    description: 'Suspense riser sub la voix avant le moment clé (allumage LED, réaction, chiffre choc). Coupure nette au payoff.',
    quand_utiliser: 'Toute scène avec une révélation. Pic de rétention garanti.',
  },
  {
    id: 'speed_ramp',
    nom: 'Speed ramp aux moments clés',
    description: 'Ralenti 0.3x sur le moment critique (3-4 frames), retour vitesse normale. CapCut/VEED auto-speed.',
    quand_utiliser: 'Allumage LED, expression de surprise, revelation visuelle.',
  },
  {
    id: 'hormozi_captions',
    nom: 'Captions style Hormozi',
    description: 'Mots colorisés mot par mot, jaune ou violet sur les mots forts. UPPERCASE, bold, bouncy in.',
    quand_utiliser: 'Tous les Reels avec voix. Boost completion rate.',
  },
  {
    id: 'angle_change',
    nom: 'Changement d\'angle caméra',
    description: 'Alterner 2 plans face cam (légèrement décalés) ou intégrer un plan de coupe à chaque cut.',
    quand_utiliser: 'Format monologue caméra long (>30s).',
  },
  {
    id: 'wait_for_it',
    nom: 'Hook "Wait for it..."',
    description: 'Texte teaser overlay 0-2s qui annonce un payoff. Le payoff arrive à 3-5s.',
    quand_utiliser: 'Format wow visuel (LED, expérience, démonstration).',
  },
  {
    id: 'split_before_after',
    nom: 'Split avant/après',
    description: 'Image partagée verticale ou cut sec. Avant à gauche/haut, après à droite/bas. Texte minimal.',
    quand_utiliser: 'Reels transformation (enfant tablette → enfant qui construit).',
  },
];
