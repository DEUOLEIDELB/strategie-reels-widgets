// Assets de signature de marque Wubo à produire UNE FOIS et réutiliser dans tous les Reels.
// Coche au fur et à mesure. Persisté localStorage via useChecklist.

export interface BrandAsset {
  id: string;
  nom: string;
  description: string;
  format: string;
}

export const ASSETS_TO_CREATE: BrandAsset[] = [
  {
    id: 'logo_intro',
    nom: 'Logo intro animé',
    description: 'Animation 0.5-1s du logo Wubo en jaune sur fond noir. À placer sur les Reels signature et fin de série.',
    format: 'mp4 + .lottie',
  },
  {
    id: 'sound_logo',
    nom: 'Sound logo Wubo',
    description: 'Signature audio courte 1-2s (note + bip LED ou texture électronique). À jouer sur le logo intro.',
    format: 'mp3 mono 48kHz',
  },
  {
    id: 'lower_third',
    nom: 'Lower-third Satoshi',
    description: 'Bandeau de prénom en bas pour identifier qui parle (Taki, Numa, Lyes). Police Satoshi UPPERCASE jaune sur fond violet 80%.',
    format: 'PNG + preset CapCut',
  },
  {
    id: 'cta_outro',
    nom: 'Frame CTA de fin',
    description: 'Frame fixe 1-2s de fin avec "Commente WUBO" + petit logo + flèche animée. Identique sur tous les Reels.',
    format: 'mp4 1080×1920',
  },
  {
    id: 'transition_signature',
    nom: 'Transition signature',
    description: 'Whoosh + flash jaune + cut. Reproductible en preset CapCut/VEED. Marque visuelle Wubo.',
    format: 'preset .json + SFX mp3',
  },
  {
    id: 'series_intros',
    nom: 'Bumpers de séries',
    description: 'Mini-intro 1s par série (Première Fois, En 60 secondes, Le Saviez-vous). Texte gros + couleur série.',
    format: '6 mp4 (un par série)',
  },
  {
    id: 'lut_led',
    nom: 'LUT plans LED',
    description: 'Filtre couleur cohérent pour tous les plans matrice LED en pièce sombre. Préserve le pop des LEDs.',
    format: 'fichier .cube',
  },
  {
    id: 'capcut_templates',
    nom: 'Templates CapCut sauvegardés',
    description: '4 templates prêts : talking head + B-roll, before/after split, listicle 3 points, wow visuel pur.',
    format: 'projets CapCut sauvegardés',
  },
];
